import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { weekStartIso } from "@/lib/meeting-date";
import { summarizeMeetingQuota } from "@/lib/meeting-quota";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { advisorId: user.id },
    orderBy: { user: { name: "asc" } },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      tasks: { select: { done: true, weekStart: true } },
      meetings: {
        select: { status: true, dateLabel: true, time: true, title: true, meetUrl: true },
      },
      payments: {
        where: { status: "odendi" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { packageId: true, packageName: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({
    students: students.map((student) => {
      const currentWeek = weekStartIso();
      const thisWeek = student.tasks.filter((task) => task.weekStart === currentWeek || task.weekStart === "");
      const done = thisWeek.filter((task) => task.done).length;
      const completion = thisWeek.length ? Math.round((done / thisWeek.length) * 100) : 0;
      const next = student.meetings.find((meeting) => meeting.status === "upcoming");
      const requests = student.meetings.filter((meeting) => meeting.status === "requested").length;
      const payment = student.payments[0];
      const packageId = student.packageId || payment?.packageId || null;
      const quota = summarizeMeetingQuota({
        packageId,
        packageStartedAt: student.packageStartedAt || payment?.createdAt || null,
        packageName: payment?.packageName || null,
        meetings: student.meetings,
      });
      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        grade: student.grade,
        program: student.program,
        completion,
        lastNet: student.lastNet,
        risk: student.risk,
        nextMeeting: next ? `${next.dateLabel} ${next.time}` : "—",
        requests,
        quota: {
          packageName: quota.packageName,
          used: quota.used,
          total: quota.total,
          remaining: quota.remaining,
          weekUsed: quota.weekUsed,
          cooldownUntilLabel: quota.cooldownUntilLabel,
        },
      };
    }),
  });
}
