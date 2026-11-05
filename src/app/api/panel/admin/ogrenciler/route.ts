import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { getPackage } from "@/lib/content";
import { prisma } from "@/lib/db";
import { summarizeMeetingQuota } from "@/lib/meeting-quota";
import { assignAdvisorSchema, createStudentSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const [students, advisors] = await Promise.all([
    prisma.studentProfile.findMany({
      orderBy: { user: { name: "asc" } },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        advisor: { select: { id: true, name: true } },
        parent: { select: { name: true, email: true, phone: true } },
        meetings: { select: { title: true, status: true, dateLabel: true, time: true, meetUrl: true } },
        payments: {
          where: { status: "odendi" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { packageId: true, packageName: true, createdAt: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "danisman" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);

  return NextResponse.json({
    advisors,
    students: students.map((student) => {
      const payment = student.payments[0];
      const packageId = student.packageId || payment?.packageId || null;
      const pack = packageId ? getPackage(packageId) : null;
      const quota = summarizeMeetingQuota({
        packageId,
        packageStartedAt: student.packageStartedAt || payment?.createdAt || null,
        packageName: payment?.packageName || pack?.name || null,
        meetings: student.meetings,
      });
      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        grade: student.grade,
        program: student.program,
        advisorId: student.advisorId,
        advisorName: student.advisor?.name ?? null,
        parentName: student.parent?.name ?? null,
        packageId,
        packageName: quota.packageName,
        meetingUsed: quota.used,
        meetingTotal: quota.total,
      };
    }),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Öğrenci, paket ve veli bilgileri gerekli." }, { status: 400 });
  }

  const pack = getPackage(parsed.data.packageId);
  if (!pack) {
    return NextResponse.json({ error: "Geçersiz paket seçimi." }, { status: 400 });
  }

  if (parsed.data.advisorId) {
    const advisor = await prisma.user.findUnique({ where: { id: parsed.data.advisorId } });
    if (!advisor || advisor.role !== "danisman") {
      return NextResponse.json({ error: "Seçilen hesap danışman değil." }, { status: 400 });
    }
  }

  const email = parsed.data.email.toLowerCase();
  const parentEmail = parsed.data.parentEmail.toLowerCase();
  if (email === parentEmail) {
    return NextResponse.json({ error: "Veli e-postası öğrencinin e-postasından farklı olmalı." }, { status: 400 });
  }

  const [existing, existingParent] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { email: parentEmail } }),
  ]);
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }
  if (existingParent && existingParent.role !== "veli") {
    return NextResponse.json({ error: "Veli e-postası başka bir hesap türünde kayıtlı." }, { status: 409 });
  }

  const student = await prisma.$transaction(async (tx) => {
    const parent =
      existingParent ??
      (await tx.user.create({
        data: {
          email: parentEmail,
          name: parsed.data.parentName,
          role: "veli",
          passwordHash: await bcrypt.hash(parsed.data.parentPassword, 10),
        },
      }));
    const user = await tx.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: "ogrenci",
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
    return tx.studentProfile.create({
      data: {
        userId: user.id,
        advisorId: parsed.data.advisorId || null,
        parentId: parent.id,
        grade: parsed.data.grade,
        program: parsed.data.program,
        packageId: pack.id,
        packageStartedAt: new Date(),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        advisor: { select: { name: true } },
        parent: { select: { name: true } },
      },
    });
  });

  const quota = summarizeMeetingQuota({
    packageId: pack.id,
    packageStartedAt: student.packageStartedAt,
    packageName: pack.name,
    meetings: [],
  });

  return NextResponse.json(
    {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      program: student.program,
      advisorId: student.advisorId,
      advisorName: student.advisor?.name ?? null,
      parentName: student.parent?.name ?? null,
      packageId: pack.id,
      packageName: pack.name,
      meetingUsed: quota.used,
      meetingTotal: quota.total,
      parentReused: Boolean(existingParent),
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = assignAdvisorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Öğrenci ve danışman seçimi gerekli." }, { status: 400 });
  }

  if (parsed.data.advisorId) {
    const advisor = await prisma.user.findUnique({ where: { id: parsed.data.advisorId } });
    if (!advisor || advisor.role !== "danisman") {
      return NextResponse.json({ error: "Seçilen hesap danışman değil." }, { status: 400 });
    }
  }

  const student = await prisma.studentProfile.update({
    where: { id: parsed.data.id },
    data: { advisorId: parsed.data.advisorId },
    include: { advisor: { select: { name: true } } },
  });

  return NextResponse.json({
    id: student.id,
    advisorId: student.advisorId,
    advisorName: student.advisor?.name ?? null,
  });
}
