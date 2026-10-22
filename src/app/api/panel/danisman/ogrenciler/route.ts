import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
      tasks: { select: { done: true } },
      meetings: {
        where: { status: { in: ["upcoming", "requested"] } },
        select: { status: true, dateLabel: true, time: true },
      },
    },
  });

  return NextResponse.json({
    students: students.map((student) => {
      const done = student.tasks.filter((task) => task.done).length;
      const completion = student.tasks.length ? Math.round((done / student.tasks.length) * 100) : 0;
      const next = student.meetings.find((meeting) => meeting.status === "upcoming");
      const requests = student.meetings.filter((meeting) => meeting.status === "requested").length;
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
      };
    }),
  });
}
