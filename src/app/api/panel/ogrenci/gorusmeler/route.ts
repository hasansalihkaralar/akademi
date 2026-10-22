import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { meetingRequestSchema } from "@/lib/validators";

async function studentProfile(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        advisor: { select: { name: true } },
        meetings: true,
      },
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: {
        advisor: { select: { name: true } },
        meetings: true,
      },
    });
  }
  return null;
}

function present(profile: NonNullable<Awaited<ReturnType<typeof studentProfile>>>) {
  const rank: Record<string, number> = { requested: 0, upcoming: 1, done: 2 };
  const meetings = [...profile.meetings].sort(
    (a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3),
  );
  return {
    coach: profile.advisor?.name ?? "Danışman",
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      dateLabel: meeting.dateLabel,
      time: meeting.time,
      type: meeting.type,
      status: meeting.status,
      note: meeting.note,
      meetUrl: meeting.meetUrl,
    })),
  };
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const profile = await studentProfile(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(present(profile));
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = meetingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Talebi bir cümleyle yaz." }, { status: 400 });
  }

  const profile = await studentProfile(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }
  if (!profile.advisorId) {
    return NextResponse.json({ error: "Henüz bir danışmanın yok." }, { status: 400 });
  }

  await prisma.meeting.create({
    data: {
      studentId: profile.id,
      title: "Görüşme talebi",
      dateLabel: "Talep",
      time: "—",
      type: "online",
      status: "requested",
      note: parsed.data.note,
    },
  });

  const fresh = await studentProfile(user);
  return NextResponse.json(present(fresh!), { status: 201 });
}
