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
    where: { authorId: user.id },
    include: { student: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    students: students.map((student) => ({
      id: student.id,
      name: student.user.name,
      grade: student.grade,
    })),
    notes: notes.map((note) => ({
      id: note.id,
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
      body: note.body,
      studentName: student.user.name,
      createdAt: note.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
