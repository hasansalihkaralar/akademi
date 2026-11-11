import { NextResponse } from "next/server";
import { getPackage } from "@/lib/content";
import { prisma } from "@/lib/db";
import { weekStartIso } from "@/lib/meeting-date";
import { hasPendingTransfer } from "@/lib/payment-pending";
import { getSessionUser } from "@/lib/session";

async function profileFor(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
        trials: { orderBy: { sortOrder: "asc" }, take: 8 },
      },
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
        trials: { orderBy: { sortOrder: "asc" }, take: 8 },
      },
    });
  }
  return null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const profile = await profileFor(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  const hasPackage = Boolean(profile.packageId);
  const pendingTransfer = hasPackage ? false : await hasPendingTransfer(profile.id);
  const pack = profile.packageId ? getPackage(profile.packageId) : null;
  const week = weekStartIso();
  const weekTasks = hasPackage
    ? profile.tasks.filter((task) => !task.weekStart || task.weekStart === week)
    : [];
  const done = weekTasks.filter((task) => task.done).length;
  const completion = weekTasks.length ? Math.round((done / weekTasks.length) * 100) : 0;
  const lastTrial = hasPackage ? profile.trials[0] ?? null : null;

  return NextResponse.json({
    viewer: user.role,
    hasPackage,
    pendingTransfer,
    packageId: profile.packageId,
    packageName: pack?.name ?? null,
    completion,
    remainingTasks: Math.max(weekTasks.length - done, 0),
    lastNet: lastTrial ? lastTrial.tyt || lastTrial.ayt : null,
    tasks: weekTasks.slice(0, 5).map((task) => ({
      id: task.id,
      day: task.day,
      subject: task.subject,
      title: task.title,
      duration: task.duration,
      done: task.done,
    })),
  });
}
