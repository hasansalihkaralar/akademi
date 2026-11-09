import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { enrollPaymentSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const [payment, advisors] = await Promise.all([
    prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } }, parent: { select: { name: true, email: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "danisman" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });

  return NextResponse.json({
    advisors,
    payment: {
      id: payment.id,
      studentName: payment.studentName,
      parentName: payment.parentName,
      phone: payment.phone,
      email: payment.email,
      grade: payment.grade,
      packageId: payment.packageId,
      packageName: payment.packageName,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      student: payment.student
        ? {
            id: payment.student.id,
            name: payment.student.user.name,
            email: payment.student.user.email,
            parentName: payment.student.parent?.name ?? null,
            parentEmail: payment.student.parent?.email ?? null,
          }
        : null,
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  if (payment.status !== "odendi") {
    return NextResponse.json({ error: "Yalnızca tamamlanan ödemeden hesap açılır." }, { status: 400 });
  }
  if (payment.studentId) {
    return NextResponse.json({ error: "Bu ödeme için öğrenci hesabı zaten açık." }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enrollPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Öğrenci bilgilerini kontrol et." }, { status: 400 });
  }

  if (parsed.data.advisorId) {
    const advisor = await prisma.user.findUnique({ where: { id: parsed.data.advisorId } });
    if (!advisor || advisor.role !== "danisman") {
      return NextResponse.json({ error: "Seçilen hesap danışman değil." }, { status: 400 });
    }
  }

  const email = parsed.data.email.toLowerCase();
  const withParent = Boolean(parsed.data.withParent);
  const parentEmail = withParent ? (parsed.data.parentEmail || "").toLowerCase() : "";
  if (withParent && email === parentEmail) {
    return NextResponse.json({ error: "Veli e-postası öğrencinin e-postasından farklı olmalı." }, { status: 400 });
  }

  const [existing, existingParent] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    withParent ? prisma.user.findUnique({ where: { email: parentEmail } }) : Promise.resolve(null),
  ]);
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }
  if (existingParent && existingParent.role !== "veli") {
    return NextResponse.json({ error: "Veli e-postası başka bir hesap türünde kayıtlı." }, { status: 409 });
  }

  const student = await prisma.$transaction(async (tx) => {
    const parent = withParent
      ? (existingParent ??
        (await tx.user.create({
          data: {
            email: parentEmail,
            name: parsed.data.parentName || payment.parentName,
            role: "veli",
            passwordHash: await bcrypt.hash(parsed.data.parentPassword || "", 10),
            emailVerifiedAt: new Date(),
          },
        })))
      : null;
    const user = await tx.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: "ogrenci",
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        emailVerifiedAt: new Date(),
      },
    });
    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        advisorId: parsed.data.advisorId || null,
        parentId: parent?.id ?? null,
        grade: parsed.data.grade,
        program: parsed.data.program,
        packageId: payment.packageId,
        packageStartedAt: payment.createdAt,
      },
      include: {
        user: { select: { name: true, email: true } },
        parent: { select: { name: true, email: true } },
      },
    });
    await tx.payment.update({ where: { id: payment.id }, data: { studentId: profile.id } });
    return profile;
  });

  return NextResponse.json(
    {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      parentName: student.parent?.name ?? null,
      parentEmail: student.parent?.email ?? null,
      parentReused: Boolean(existingParent),
    },
    { status: 201 },
  );
}
