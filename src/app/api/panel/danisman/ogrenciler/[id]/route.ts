import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { weekStartIso } from "@/lib/meeting-date";
import { summarizeMeetingQuota } from "@/lib/meeting-quota";
import { getSessionUser } from "@/lib/session";
import { createTaskSchema, normalizeVideoUrl } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const student = await prisma.studentProfile.findFirst({
    where: { id, advisorId: user.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      parent: { select: { name: true, phone: true, email: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
      dayNotes: true,
      trials: { orderBy: { sortOrder: "asc" } },
      meetings: { orderBy: { dateLabel: "asc" } },
      payments: {
        where: { status: "odendi" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { packageId: true, packageName: true, createdAt: true },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const currentWeek = weekStartIso();
  const thisWeek = student.tasks.filter((task) => task.weekStart === currentWeek || task.weekStart === "");
  const done = thisWeek.filter((task) => task.done).length;
  const payment = student.payments[0];
  const packageId = student.packageId || payment?.packageId || null;
  const quota = summarizeMeetingQuota({
    packageId,
    packageStartedAt: student.packageStartedAt || payment?.createdAt || null,
    packageName: payment?.packageName || null,
    meetings: student.meetings,
  });

  return NextResponse.json({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    phone: student.user.phone,
    grade: student.grade,
    program: student.program,
    risk: student.risk,
    lastNet: student.lastNet,
    completion: thisWeek.length ? Math.round((done / thisWeek.length) * 100) : 0,
    parent: student.parent,
    quota: {
      packageId: quota.packageId,
      packageName: quota.packageName,
      used: quota.used,
      total: quota.total,
      remaining: quota.remaining,
      weekUsed: quota.weekUsed,
      weeklyLimit: quota.weeklyLimit,
      cooldownUntilLabel: quota.cooldownUntilLabel,
    },
    tasks: student.tasks,
    dayNotes: student.dayNotes.map((note) => ({
      id: note.id,
      weekStart: note.weekStart,
      day: note.day,
      body: note.body,
    })),
    trials: student.trials,
    meetings: student.meetings,
    notes: student.notes.map((note) => ({
      id: note.id,
      body: note.body,
      author: note.author.name,
      createdAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gün, ders, başlık ve süre gerekli." }, { status: 400 });
  }

  const videoUrl = normalizeVideoUrl(parsed.data.videoUrl ?? "");
  if ((parsed.data.videoUrl ?? "").trim() && !videoUrl) {
    return NextResponse.json({ error: "Video linki geçerli bir adres olmalı." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id, advisorId: user.id },
    select: { id: true, tasks: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
  });
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const task = await prisma.task.create({
    data: {
      studentId: student.id,
      weekStart: parsed.data.weekStart,
      day: parsed.data.day,
      subject: parsed.data.subject,
      title: parsed.data.title,
      duration: parsed.data.duration,
      videoUrl: videoUrl || null,
      sortOrder: (student.tasks[0]?.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(
    {
      id: task.id,
      weekStart: task.weekStart,
      day: task.day,
      subject: task.subject,
      title: task.title,
      duration: task.duration,
      videoUrl: task.videoUrl,
      done: task.done,
      sortOrder: task.sortOrder,
    },
    { status: 201 },
  );
}
