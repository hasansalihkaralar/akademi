import { NextResponse } from "next/server";
import { advisorSlotConflict } from "@/lib/advisor-availability";
import { prisma } from "@/lib/db";
import { createMeetLink, deleteMeetEvent, updateMeetEvent } from "@/lib/google";
import { meetingDateLabel } from "@/lib/meeting-date";
import { getSessionUser } from "@/lib/session";
import { confirmMeetingSchema, createMeetingSchema, updateMeetingSchema } from "@/lib/validators";

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

  const conflict = await advisorSlotConflict(user.id, parsed.data.date, dateLabel, parsed.data.time);
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 });
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
    return NextResponse.json({ error: "Talep bilgilerini kontrol et." }, { status: 400 });
  }

  const student = await ownedStudent(user.id, id);
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const existing = await prisma.meeting.findFirst({
    where: { id: parsed.data.id, studentId: student.id, status: "requested" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const advisorNote = parsed.data.advisorNote?.trim() || null;
  const isParent = existing.title === "Veli görüşme talebi";

  if (parsed.data.outcome === "yapildi") {
    const meeting = await prisma.meeting.update({
      where: { id: existing.id },
      data: {
        title: isParent ? "Veli görüşmesi" : existing.title === "Görüşme talebi" ? "Tamamlanan görüşme" : existing.title,
        status: "done",
        advisorNote,
      },
    });
    return NextResponse.json(meeting);
  }

  const date = parsed.data.date || "";
  const time = parsed.data.time || "";
  const dateLabel = meetingDateLabel(date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const conflict = await advisorSlotConflict(user.id, date, dateLabel, time);
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  const nextTitle = isParent
    ? "Veli görüşmesi"
    : existing.title === "Görüşme talebi"
      ? "Planlanan görüşme"
      : existing.title;

  const updated = await prisma.meeting.update({
    where: { id: existing.id },
    data: {
      title: nextTitle,
      dateLabel,
      time,
      status: "upcoming",
      advisorNote: isParent ? advisorNote : existing.advisorNote,
    },
  });
  const meeting = await withMeet(updated, student.user.name, date, time);

  return NextResponse.json(meeting);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateMeetingSchema.safeParse(body);
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

  const existing = await prisma.meeting.findFirst({
    where: { id: parsed.data.id, studentId: student.id, status: "upcoming" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
  }

  const time = parsed.data.time.slice(0, 5);
  const conflict = await advisorSlotConflict(user.id, parsed.data.date, dateLabel, time, existing.id);
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      dateLabel,
      time,
      type: parsed.data.type,
      note: parsed.data.note || null,
    },
  });

  if (meeting.googleEventId) {
    await updateMeetEvent({
      eventId: meeting.googleEventId,
      title: meeting.title,
      studentName: student.user.name,
      date: parsed.data.date,
      time,
      note: meeting.note,
    }).catch(() => false);
  }

  return NextResponse.json(meeting);
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const meetingId = typeof body?.id === "string" ? body.id : "";
  if (!meetingId) {
    return NextResponse.json({ error: "Randevu seçilmedi." }, { status: 400 });
  }

  const student = await ownedStudent(user.id, id);
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const existing = await prisma.meeting.findFirst({
    where: { id: meetingId, studentId: student.id, status: "upcoming" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
  }

  if (existing.googleEventId) {
    await deleteMeetEvent(existing.googleEventId).catch(() => false);
  }
  await prisma.meeting.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
