import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { advisorOccupiedTimes } from "@/lib/advisor-availability";
import { meetingDateLabel } from "@/lib/meeting-date";
import { availableSlots, localIsoTomorrow } from "@/lib/meeting-slots";
import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ogrenci") {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, advisorId: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }
  if (!profile.advisorId) {
    return NextResponse.json({ error: "Henüz bir danışman atanmamış." }, { status: 400 });
  }

  const date = new URL(request.url).searchParams.get("date") || "";
  const dateLabel = meetingDateLabel(date);
  if (!dateLabel) {
    return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
  }

  const earliest = localIsoTomorrow();
  if (date < earliest) {
    return NextResponse.json({ date, slots: [] as string[] });
  }

  const taken = await advisorOccupiedTimes(profile.advisorId, date, dateLabel);
  const slots = availableSlots(taken);

  return NextResponse.json({ date, slots });
}
