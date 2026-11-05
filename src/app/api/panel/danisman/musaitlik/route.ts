import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { meetingDateLabel } from "@/lib/meeting-date";
import { allDaySlots, conflictsWithTaken, isBookableSlot, localIsoToday } from "@/lib/meeting-slots";
import { getSessionUser } from "@/lib/session";
import { advisorBlockSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date") || "";
  const dateLabel = meetingDateLabel(date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const [meetings, blocks] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        dateLabel,
        status: "upcoming",
        student: { advisorId: user.id },
      },
      select: {
        time: true,
        title: true,
        student: { select: { user: { select: { name: true } } } },
      },
    }),
    prisma.advisorBlock.findMany({
      where: { advisorId: user.id, dateIso: date },
      orderBy: { time: "asc" },
      select: { id: true, time: true, note: true, dateIso: true, dateLabel: true },
    }),
  ]);

  const meetingTimes = meetings.map((meeting) => meeting.time.slice(0, 5));
  const blockTimes = blocks.map((block) => block.time.slice(0, 5));

  const slots = allDaySlots().map((time) => {
    const meeting = meetings.find((item) => conflictsWithTaken(time, [item.time.slice(0, 5)]));
    const block = blocks.find((item) => item.time.slice(0, 5) === time);
    const blockedByOverlap = !block && conflictsWithTaken(time, blockTimes);
    let status: "free" | "meeting" | "blocked" | "busy" = "free";
    let label = "Müsait";
    if (block) {
      status = "blocked";
      label = block.note || "Kapalı";
    } else if (meeting) {
      status = "meeting";
      label = `${meeting.student.user.name} · ${meeting.time}`;
    } else if (blockedByOverlap || conflictsWithTaken(time, meetingTimes)) {
      status = "busy";
      label = "Çakışıyor";
    }
    return { time, status, label, blockId: block?.id ?? null };
  });

  return NextResponse.json({ date, dateLabel, slots, blocks });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = advisorBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tarih ve saat seç." }, { status: 400 });
  }

  const time = parsed.data.time.slice(0, 5);
  if (!isBookableSlot(time)) {
    return NextResponse.json({ error: "Saat 12:00–21:00 arasında 15 dakikalık dilim olmalı." }, { status: 400 });
  }

  const dateLabel = meetingDateLabel(parsed.data.date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  if (parsed.data.date < localIsoToday()) {
    return NextResponse.json({ error: "Geçmiş güne saat kapatılamaz." }, { status: 400 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { dateLabel, status: "upcoming", student: { advisorId: user.id } },
    select: { time: true, student: { select: { user: { select: { name: true } } } } },
  });
  const clash = meetings.find((meeting) => conflictsWithTaken(time, [meeting.time.slice(0, 5)]));
  if (clash) {
    return NextResponse.json(
      { error: `${clash.time} diliminde ${clash.student.user.name} ile randevu var. Önce onu düzenle.` },
      { status: 409 },
    );
  }

  try {
    const block = await prisma.advisorBlock.create({
      data: {
        advisorId: user.id,
        dateIso: parsed.data.date,
        dateLabel,
        time,
        note: parsed.data.note?.trim() || null,
      },
    });
    return NextResponse.json(block, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bu saat zaten kapalı." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Kapatma kaydı seçilmedi." }, { status: 400 });
  }

  const existing = await prisma.advisorBlock.findFirst({
    where: { id, advisorId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }

  await prisma.advisorBlock.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
