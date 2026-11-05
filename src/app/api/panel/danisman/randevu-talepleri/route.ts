import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      student: { advisorId: user.id },
      status: "requested",
      title: "Veli görüşme talebi",
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          parent: { select: { name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({
    requests: meetings.map((meeting) => ({
      id: meeting.id,
      studentId: meeting.studentId,
      studentName: meeting.student.user.name,
      studentEmail: meeting.student.user.email,
      studentPhone: meeting.student.user.phone,
      title: meeting.title,
      note: meeting.note,
      fromParent: true,
      parentName: meeting.student.parent?.name ?? null,
      parentEmail: meeting.student.parent?.email ?? null,
      parentPhone: meeting.student.parent?.phone ?? null,
    })),
  });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Talep seçilmedi." }, { status: 400 });
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id, status: "requested", student: { advisorId: user.id } },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  await prisma.meeting.delete({ where: { id: meeting.id } });
  return NextResponse.json({ ok: true });
}
