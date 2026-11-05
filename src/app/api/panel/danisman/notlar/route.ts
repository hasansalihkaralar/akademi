import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { noteSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { advisorId: user.id },
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const notes = await prisma.sessionNote.findMany({
    where: { authorId: user.id, student: { advisorId: user.id } },
    include: { student: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    students: students.map((student) => ({
      id: student.id,
      name: student.user.name,
      grade: student.grade,
    })),
    notes: notes.map((note) => ({
      id: note.id,
      studentId: note.studentId,
      body: note.body,
      studentName: note.student.user.name,
      createdAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Not çok kısa veya öğrenci seçilmedi." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: parsed.data.studentId, advisorId: user.id },
    include: { user: { select: { name: true } } },
  });
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const note = await prisma.sessionNote.create({
    data: {
      studentId: student.id,
      authorId: user.id,
      body: parsed.data.body,
    },
  });

  return NextResponse.json(
    {
      id: note.id,
      studentId: note.studentId,
      body: note.body,
      studentName: student.user.name,
      createdAt: note.createdAt.toISOString(),
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Not seçilmedi." }, { status: 400 });
  }

  const note = await prisma.sessionNote.findFirst({
    where: { id, authorId: user.id, student: { advisorId: user.id } },
  });
  if (!note) {
    return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
  }

  await prisma.sessionNote.delete({ where: { id: note.id } });
  return NextResponse.json({ ok: true });
}
