import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPackage } from "@/lib/content";
import { prisma } from "@/lib/db";
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
        status: String(form.get("status") || "havale_bekliyor"),
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
  let status: "odendi" | "basarisiz" | "havale_bekliyor" =
    method === "havale" ? "havale_bekliyor" : parsed.data.demoFail ? "basarisiz" : "odendi";
  let receiptUrl: string | null = null;

  if (method === "havale") {
    status = "havale_bekliyor";
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
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          studentName: profile.user.name,
          parentName: profile.parent?.name || "—",
          phone: profile.user.phone || parsed.data.phone,
          email: profile.user.email,
          grade: parsed.data.grade || profile.grade,
          packageId: pack.id,
          packageName: pack.name,
          amount: pack.price,
          status,
          method,
          receiptUrl,
          studentId: profile.id,
        },
      });

      if (status === "odendi") {
        await tx.studentProfile.update({
          where: { id: profile.id },
          data: {
            packageId: pack.id,
            packageStartedAt: new Date(),
            grade: parsed.data.grade || profile.grade,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      { id: payment.id, status: payment.status, method: payment.method },
      { status: 201 },
    );
  } catch (error) {
    console.error("[odeme]", error);
    return NextResponse.json(
      { error: "Ödeme kaydı oluşturulamadı. Biraz sonra tekrar dene." },
      { status: 500 },
    );
  }
}
