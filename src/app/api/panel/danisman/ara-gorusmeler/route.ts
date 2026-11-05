import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { meetingLabelToIso, parseIsoDate } from "@/lib/meeting-date";
import { getSessionUser } from "@/lib/session";
import { meetingAttendanceSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function attendanceOf(status: string) {
  if (status === "done") return "yapildi";
  if (status === "missed") return "yapilmadi";
  return null;
}

/** Görüşme tarih+saati geçmiş mi? (Europe/Istanbul) */
function meetingHasPassed(dateLabel: string, time: string, now = new Date()) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const yearNow = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
    }).format(now),
  );

  const pastCandidates: number[] = [];
  for (const year of [yearNow, yearNow - 1]) {
    const iso = meetingLabelToIso(dateLabel, year);
    const date = parseIsoDate(iso);
    if (!date) continue;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    const ms = Date.parse(`${y}-${m}-${d}T${hh}:${mm}:00+03:00`);
    if (Number.isNaN(ms)) continue;
    if (ms <= now.getTime()) pastCandidates.push(ms);
  }

  return pastCandidates.length > 0;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      student: { advisorId: user.id },
      meetUrl: { not: null },
      status: { in: ["upcoming", "done", "missed"] },
      NOT: {
        OR: [{ title: "Veli görüşme talebi" }, { title: "Veli görüşmesi" }],
      },
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: [{ dateLabel: "desc" }, { time: "desc" }],
  });

  const past = meetings.filter((meeting) => meetingHasPassed(meeting.dateLabel, meeting.time));

  return NextResponse.json(
    {
      meetings: past.map((meeting) => ({
        id: meeting.id,
        studentId: meeting.studentId,
        studentName: meeting.student.user.name,
        studentEmail: meeting.student.user.email,
        studentPhone: meeting.student.user.phone,
        grade: meeting.student.grade,
        program: meeting.student.program,
        title: meeting.title,
        dateLabel: meeting.dateLabel,
        time: meeting.time,
        meetUrl: meeting.meetUrl,
        status: meeting.status,
        attendance: attendanceOf(meeting.status),
        note: meeting.note,
        advisorNote: meeting.advisorNote,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = meetingAttendanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Görüşme durumu seçilmedi." }, { status: 400 });
  }

  const existing = await prisma.meeting.findFirst({
    where: {
      id: parsed.data.id,
      student: { advisorId: user.id },
      meetUrl: { not: null },
      status: { in: ["upcoming", "done", "missed"] },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Görüşme bulunamadı." }, { status: 404 });
  }

  const status = parsed.data.attendance === "yapildi" ? "done" : "missed";
  const note = (parsed.data.advisorNote || "").trim();
  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: {
      status,
      advisorNote: note || null,
    },
  });

  return NextResponse.json({
    id: meeting.id,
    status: meeting.status,
    attendance: attendanceOf(meeting.status),
    advisorNote: meeting.advisorNote,
  });
}
