import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMeetLink } from "@/lib/google";
import { meetingDateLabel } from "@/lib/meeting-date";
import { getSessionUser } from "@/lib/session";
import { confirmMeetingSchema, createMeetingSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

async function ownedStudent(advisorId: string, studentId: string) {
  return prisma.studentProfile.findFirst({
    where: { id: studentId, advisorId },
    select: { id: true, user: { select: { name: true } } },
  });
}

async function withMeet(
  meeting: { id: string; title: string; note: string | null },
  studentName: string,
  date: string,
  time: string,
) {
  const link = await createMeetLink({
    requestId: meeting.id,
    title: meeting.title,
    studentName,
    date,
    time,
    note: meeting.note,
  }).catch(() => null);
  if (!link?.meetUrl) return prisma.meeting.findUniqueOrThrow({ where: { id: meeting.id } });
  return prisma.meeting.update({
    where: { id: meeting.id },
    data: { meetUrl: link.meetUrl, googleEventId: link.eventId },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Başlık, tarih ve saat gerekli." }, { status: 400 });
  }

  const student = await ownedStudent(user.id, id);
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const dateLabel = meetingDateLabel(parsed.data.date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const created = await prisma.meeting.create({
    data: {
      studentId: student.id,
      title: parsed.data.title,
      dateLabel,
      time: parsed.data.time,
      type: parsed.data.type,
      status: "upcoming",
      note: parsed.data.note || null,
    },
  });
  const meeting = await withMeet(created, student.user.name, parsed.data.date, parsed.data.time);

  return NextResponse.json(meeting, { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = confirmMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tarih ve saat gerekli." }, { status: 400 });
  }

  const student = await ownedStudent(user.id, id);
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const dateLabel = meetingDateLabel(parsed.data.date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const existing = await prisma.meeting.findFirst({
    where: { id: parsed.data.id, studentId: student.id, status: "requested" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const updated = await prisma.meeting.update({
    where: { id: existing.id },
    data: {
      title: existing.title === "Görüşme talebi" ? "Planlanan görüşme" : existing.title,
      dateLabel,
      time: parsed.data.time,
      status: "upcoming",
    },
  });
  const meeting = await withMeet(updated, student.user.name, parsed.data.date, parsed.data.time);

  return NextResponse.json(meeting);
}
