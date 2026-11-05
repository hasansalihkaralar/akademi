import { NextResponse } from "next/server";
import { advisorSlotConflict } from "@/lib/advisor-availability";
import { prisma } from "@/lib/db";
import { attachMeetToMeeting, createMeetLink, googleTokenHealthy } from "@/lib/google";
import { meetingDateLabel } from "@/lib/meeting-date";
import { summarizeMeetingQuota } from "@/lib/meeting-quota";
import { isBookableSlot, localIsoTomorrow } from "@/lib/meeting-slots";
import { getSessionUser } from "@/lib/session";
import { meetingRequestSchema, studentBookMeetingSchema } from "@/lib/validators";

const profileInclude = {
  advisor: { select: { name: true } },
  meetings: true,
  user: { select: { name: true } },
  payments: {
    where: { status: "odendi" },
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { packageId: true, packageName: true, createdAt: true },
  },
};

async function studentProfile(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: profileInclude,
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: profileInclude,
    });
  }
  return null;
}

function resolvedPackage(profile: NonNullable<Awaited<ReturnType<typeof studentProfile>>>) {
  if (profile.packageId) {
    return {
      packageId: profile.packageId,
      packageStartedAt: profile.packageStartedAt,
      packageName: profile.payments[0]?.packageName ?? null,
    };
  }
  const payment = profile.payments[0];
  if (!payment) return { packageId: null, packageStartedAt: null, packageName: null };
  return {
    packageId: payment.packageId,
    packageStartedAt: payment.createdAt,
    packageName: payment.packageName,
  };
}

function present(
  profile: NonNullable<Awaited<ReturnType<typeof studentProfile>>>,
  hideMeet = false,
  targetDateIso?: string,
) {
  const rank: Record<string, number> = { requested: 0, upcoming: 1, done: 2 };
  const meetings = [...profile.meetings].sort(
    (a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3),
  );
  const pack = resolvedPackage(profile);
  const quota = summarizeMeetingQuota({
    packageId: pack.packageId,
    packageStartedAt: pack.packageStartedAt,
    packageName: pack.packageName,
    meetings,
    targetDateIso,
  });
  return {
    coach: profile.advisor?.name ?? "Danışman",
    quota,
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      dateLabel: meeting.dateLabel,
      time: meeting.time,
      type: meeting.type,
      status: meeting.status,
      note: meeting.note,
      advisorNote: meeting.advisorNote,
      meetUrl: hideMeet ? null : meeting.meetUrl,
    })),
  };
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  let profile = await studentProfile(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  if (user.role === "ogrenci") {
    const missing = profile.meetings.filter(
      (meeting) => meeting.status === "upcoming" && !meeting.meetUrl && meeting.dateLabel !== "Talep",
    );
    if (missing.length > 0) {
      const health = await googleTokenHealthy();
      if (health.healthy) {
        for (const meeting of missing) {
          await attachMeetToMeeting(meeting.id).catch(() => undefined);
        }
        profile = (await studentProfile(user)) || profile;
      }
    }
  }

  return NextResponse.json({ ...present(profile, user.role === "veli"), viewer: user.role });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profile = await studentProfile(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }
  if (!profile.advisorId) {
    return NextResponse.json({ error: "Henüz bir danışman atanmamış." }, { status: 400 });
  }

  if (user.role === "veli") {
    const parsed = meetingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Talebi bir cümleyle yaz." }, { status: 400 });
    }

    await prisma.meeting.create({
      data: {
        studentId: profile.id,
        title: "Veli görüşme talebi",
        dateLabel: "Talep",
        time: "—",
        type: "online",
        status: "requested",
        note: parsed.data.note,
      },
    });

    const fresh = await studentProfile(user);
    return NextResponse.json({ ...present(fresh!, true), viewer: user.role }, { status: 201 });
  }

  const parsed = studentBookMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tarih ve saat seç." }, { status: 400 });
  }

  const time = parsed.data.time.slice(0, 5);
  if (!isBookableSlot(time)) {
    return NextResponse.json(
      { error: "Saat 12:00–21:00 arasında 15 dakikalık dilimlerden biri olmalı." },
      { status: 400 },
    );
  }

  const dateLabel = meetingDateLabel(parsed.data.date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const earliest = localIsoTomorrow();
  if (parsed.data.date < earliest) {
    return NextResponse.json(
      { error: "Aynı güne randevu alınamaz. En erken yarın için seçim yap." },
      { status: 400 },
    );
  }

  const pack = resolvedPackage(profile);
  const quota = summarizeMeetingQuota({
    packageId: pack.packageId,
    packageStartedAt: pack.packageStartedAt,
    packageName: pack.packageName,
    meetings: profile.meetings,
    targetDateIso: parsed.data.date,
  });
  if (!quota.canBook) {
    return NextResponse.json({ error: quota.reason || "Toplantı hakkın yok." }, { status: 403 });
  }
  if (!profile.packageId && pack.packageId) {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { packageId: pack.packageId, packageStartedAt: pack.packageStartedAt },
    });
  }

  const conflict = await advisorSlotConflict(profile.advisorId, parsed.data.date, dateLabel, time);
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  const note = parsed.data.note?.trim() || null;
  const created = await prisma.meeting.create({
    data: {
      studentId: profile.id,
      title: "Planlanan görüşme",
      dateLabel,
      time,
      type: "online",
      status: "upcoming",
      note,
    },
  });

  const link = await createMeetLink({
    requestId: created.id,
    title: created.title,
    studentName: profile.user.name,
    date: parsed.data.date,
    time,
    note,
  }).catch((error: unknown) => ({
    meetUrl: null as string | null,
    eventId: null as string | null,
    error: error instanceof Error ? error.message : "Meet oluşturulamadı.",
  }));

  if (!link.meetUrl) {
    await prisma.meeting.delete({ where: { id: created.id } }).catch(() => undefined);
    return NextResponse.json(
      {
        error:
          link.error ||
          "Meet linki oluşturulamadı. Yönetim panelinden Google hesabını yeniden bağlayıp tekrar dene.",
      },
      { status: 502 },
    );
  }

  await prisma.meeting.update({
    where: { id: created.id },
    data: { meetUrl: link.meetUrl, googleEventId: link.eventId },
  });

  const fresh = await studentProfile(user);
  return NextResponse.json({ ...present(fresh!), viewer: user.role }, { status: 201 });
}
