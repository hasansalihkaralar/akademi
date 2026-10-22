import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { student: { advisorId: user.id }, status: { in: ["upcoming", "done"] } },
    include: { student: { include: { user: { select: { name: true } } } } },
    orderBy: { time: "asc" },
  });

  return NextResponse.json({
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      student: meeting.student.user.name,
      title: meeting.title,
      dateLabel: meeting.dateLabel,
      time: meeting.time,
      type: meeting.type,
      status: meeting.status,
      note: meeting.note,
      meetUrl: meeting.meetUrl,
    })),
  });
}
