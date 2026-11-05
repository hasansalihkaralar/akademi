import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getPackage, packages } from "@/lib/content";
import { prisma } from "@/lib/db";
import { summarizeMeetingQuota } from "@/lib/meeting-quota";
import { updateStudentPackageSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const [student, advisors] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        advisor: { select: { id: true, name: true, title: true, email: true } },
        parent: { select: { name: true, email: true, phone: true } },
        meetings: { orderBy: { id: "desc" } },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            packageId: true,
            packageName: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        trials: { orderBy: { sortOrder: "asc" }, take: 5 },
      },
    }),
    prisma.user.findMany({
      where: { role: "danisman" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);

  if (!student) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const payment = student.payments.find((item) => item.status === "odendi") || student.payments[0];
  const packageId = student.packageId || payment?.packageId || null;
  const pack = packageId ? getPackage(packageId) : null;
  const quota = summarizeMeetingQuota({
    packageId,
    packageStartedAt: student.packageStartedAt || payment?.createdAt || null,
    packageName: payment?.packageName || pack?.name || null,
    meetings: student.meetings,
  });

  return NextResponse.json({
    advisors,
    packages: packages.map((item) => ({
      id: item.id,
      name: item.name,
      duration: item.duration,
      program: item.program,
      price: item.price,
    })),
    student: {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      program: student.program,
      risk: student.risk,
      lastNet: student.lastNet,
      packageId,
      packageStartedAt: student.packageStartedAt?.toISOString() ?? null,
      advisor: student.advisor,
      parent: student.parent,
      quota: {
        packageName: quota.packageName,
        used: quota.used,
        total: quota.total,
        remaining: quota.remaining,
        weekUsed: quota.weekUsed,
        weeklyLimit: quota.weeklyLimit,
        cooldownUntilLabel: quota.cooldownUntilLabel,
      },
      meetings: student.meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        dateLabel: meeting.dateLabel,
        time: meeting.time,
        status: meeting.status,
        note: meeting.note,
        meetUrl: meeting.meetUrl,
      })),
      payments: student.payments.map((item) => ({
        id: item.id,
        packageName: item.packageName,
        amount: item.amount,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
      trials: student.trials,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateStudentPackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paket seçimi gerekli." }, { status: 400 });
  }

  const pack = getPackage(parsed.data.packageId);
  if (!pack) {
    return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
  }

  const existing = await prisma.studentProfile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const student = await prisma.studentProfile.update({
    where: { id },
    data: {
      packageId: pack.id,
      packageStartedAt: existing.packageStartedAt || new Date(),
    },
    include: {
      meetings: { select: { title: true, status: true, dateLabel: true, time: true, meetUrl: true } },
    },
  });

  const quota = summarizeMeetingQuota({
    packageId: pack.id,
    packageStartedAt: student.packageStartedAt,
    packageName: pack.name,
    meetings: student.meetings,
  });

  return NextResponse.json({
    packageId: pack.id,
    packageName: pack.name,
    packageStartedAt: student.packageStartedAt?.toISOString() ?? null,
    quota: {
      packageName: quota.packageName,
      used: quota.used,
      total: quota.total,
      remaining: quota.remaining,
      weekUsed: quota.weekUsed,
      weeklyLimit: quota.weeklyLimit,
      cooldownUntilLabel: quota.cooldownUntilLabel,
    },
  });
}
