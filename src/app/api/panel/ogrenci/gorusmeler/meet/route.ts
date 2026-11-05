import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { attachMeetToMeeting } from "@/lib/google";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ogrenci") {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Randevu seçilmedi." }, { status: 400 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id, studentId: profile.id, status: "upcoming" },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
  }

  const result = await attachMeetToMeeting(meeting.id);
  if (!result.meetUrl) {
    return NextResponse.json({ error: result.error || "Meet linki oluşmadı." }, { status: 502 });
  }

  return NextResponse.json({ id: meeting.id, meetUrl: result.meetUrl });
}
