import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { brand, getPackage } from "@/lib/content";
import { prisma } from "@/lib/db";
import {
  appPublicUrl,
  initializeCheckoutForm,
  iyzicoConfigured,
  normalizeGsm,
  splitName,
} from "@/lib/iyzico";
import { getSessionUser } from "@/lib/session";
import { paymentSchema } from "@/lib/validators";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

function receiptExtension(file: File, buffer: Buffer) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || buffer.subarray(0, 4).toString() === "%PDF") return "pdf";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return "webp";
  return null;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    if (!form) return { data: null, file: null };
    return {
      data: {
        studentName: String(form.get("studentName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        grade: String(form.get("grade") || ""),
        packageId: String(form.get("packageId") || ""),
        method: String(form.get("method") || "havale"),
      },
      file: form.get("receipt"),
    };
  }

  const body = await request.json().catch(() => null);
  return { data: body, file: null };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ogrenci") {
    return NextResponse.json(
      { error: "Paket satın almak için önce öğrenci hesabıyla giriş yap." },
      { status: 401 },
    );
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: { parent: { select: { name: true } }, user: { select: { name: true, email: true, phone: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  const { data, file } = await parseBody(request);
  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ödeme bilgilerini kontrol et." }, { status: 400 });
  }

  const pack = getPackage(parsed.data.packageId);
  if (!pack) {
    return NextResponse.json({ error: "Paket bulunamadı." }, { status: 400 });
  }

  const method = parsed.data.method || "kart";
  let receiptUrl: string | null = null;

  if (method === "havale") {
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: "Havale/EFT için dekont yüklemen gerekir." }, { status: 400 });
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: "Dekont en fazla 5 MB olabilir." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = receiptExtension(file, buffer);
    if (!extension) {
      return NextResponse.json({ error: "Dekont PDF, JPG, PNG veya WEBP olmalı." }, { status: 400 });
    }
    const filename = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", "dekontlar");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer);
    receiptUrl = `/uploads/dekontlar/${filename}`;

    try {
      const payment = await prisma.payment.create({
        data: {
          studentName: profile.user.name,
          parentName: profile.parent?.name || "—",
          phone: profile.user.phone || parsed.data.phone,
          email: profile.user.email,
          grade: parsed.data.grade || profile.grade,
          packageId: pack.id,
          packageName: pack.name,
          amount: pack.price,
          status: "havale_bekliyor",
          method: "havale",
          receiptUrl,
          studentId: profile.id,
        },
      });

      return NextResponse.json(
        { id: payment.id, status: payment.status, method: payment.method },
        { status: 201 },
      );
    } catch (error) {
      console.error("[odeme] havale", error);
      return NextResponse.json(
        { error: "Ödeme kaydı oluşturulamadı. Biraz sonra tekrar dene." },
        { status: 500 },
      );
    }
  }

  if (!iyzicoConfigured()) {
    return NextResponse.json(
      { error: "Kart ödemesi şu an yapılandırılmamış. Havale/EFT kullan veya yöneticiye bildir." },
      { status: 503 },
    );
  }

  let paymentId: string | null = null;
  try {
    // Yarım kalan kart ödemelerini temizle; kullanıcı yeniden deneyebilsin.
    await prisma.payment.updateMany({
      where: { studentId: profile.id, status: "odeme_bekliyor", method: "kart" },
      data: { status: "basarisiz" },
    });

    const payment = await prisma.payment.create({
      data: {
        studentName: profile.user.name,
        parentName: profile.parent?.name || "—",
        phone: profile.user.phone || parsed.data.phone,
        email: profile.user.email,
        grade: parsed.data.grade || profile.grade,
        packageId: pack.id,
        packageName: pack.name,
        amount: pack.price,
        status: "odeme_bekliyor",
        method: "kart",
        studentId: profile.id,
      },
    });
    paymentId = payment.id;

    const { name, surname } = splitName(profile.user.name);
    const address = brand.address;
    const init = await initializeCheckoutForm({
      conversationId: payment.id,
      basketId: payment.id,
      price: pack.price,
      callbackUrl: `${appPublicUrl()}/api/odeme/iyzico/callback`,
      buyer: {
        id: profile.id,
        name,
        surname,
        email: profile.user.email,
        gsmNumber: normalizeGsm(profile.user.phone || parsed.data.phone),
        registrationAddress: address,
        ip: clientIp(request),
        city: "Istanbul",
        country: "Turkey",
      },
      billingAddress: {
        contactName: profile.user.name,
        city: "Istanbul",
        country: "Turkey",
        address,
      },
      basketItem: {
        id: pack.id,
        name: pack.name,
        category1: pack.program.toUpperCase(),
      },
    });

    const paymentPageUrl = init.paymentPageUrl || "";
    if (init.status !== "success" || !init.token || !paymentPageUrl) {
      console.error("[odeme] iyzico init failed", init);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "basarisiz" },
      });
      return NextResponse.json(
        {
          error:
            init.errorMessage ||
            "iyzico ödeme formu başlatılamadı. Sandbox’ta callback için HTTPS veya canlı/ngrok gerekir.",
        },
        { status: 502 },
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { iyzicoToken: init.token },
    });

    return NextResponse.json(
      {
        id: payment.id,
        status: "odeme_bekliyor",
        method: "kart",
        paymentPageUrl,
        token: init.token,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[odeme] iyzico", error);
    if (paymentId) {
      await prisma.payment
        .update({ where: { id: paymentId }, data: { status: "basarisiz" } })
        .catch(() => undefined);
    }
    return NextResponse.json(
      { error: "Kart ödemesi başlatılamadı. Biraz sonra tekrar dene." },
      { status: 500 },
    );
  }
}
