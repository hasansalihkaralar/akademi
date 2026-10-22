import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { dayNoteSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = dayNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gün notu kaydedilemedi." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id, advisorId: user.id },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const where = {
    studentId_weekStart_day: {
      studentId: student.id,
      weekStart: parsed.data.weekStart,
      day: parsed.data.day,
    },
  };

  if (!parsed.data.body) {
    await prisma.dayNote.deleteMany({
      where: { studentId: student.id, weekStart: parsed.data.weekStart, day: parsed.data.day },
    });
    return NextResponse.json({ weekStart: parsed.data.weekStart, day: parsed.data.day, body: "" });
  }

  const note = await prisma.dayNote.upsert({
    where,
    create: {
      studentId: student.id,
      weekStart: parsed.data.weekStart,
      day: parsed.data.day,
      body: parsed.data.body,
    },
    update: { body: parsed.data.body },
  });

  return NextResponse.json({
    id: note.id,
    weekStart: note.weekStart,
    day: note.day,
    body: note.body,
  });
}
