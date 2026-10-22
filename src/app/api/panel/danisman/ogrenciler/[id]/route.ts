import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { createTaskSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const student = await prisma.studentProfile.findFirst({
    where: { id, advisorId: user.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      parent: { select: { name: true, phone: true, email: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
      trials: { orderBy: { sortOrder: "asc" } },
      meetings: { orderBy: { dateLabel: "asc" } },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const done = student.tasks.filter((task) => task.done).length;
  return NextResponse.json({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    phone: student.user.phone,
    grade: student.grade,
    program: student.program,
    risk: student.risk,
    lastNet: student.lastNet,
    completion: student.tasks.length ? Math.round((done / student.tasks.length) * 100) : 0,
    parent: student.parent,
    tasks: student.tasks,
    trials: student.trials,
    meetings: student.meetings,
    notes: student.notes.map((note) => ({
      id: note.id,
      body: note.body,
      author: note.author.name,
      createdAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Danışman oturumu gerekli." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gün, ders, başlık ve süre gerekli." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id, advisorId: user.id },
    select: { id: true, tasks: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
  });
  if (!student) {
    return NextResponse.json({ error: "Bu öğrenci sana bağlı değil." }, { status: 404 });
  }

  const task = await prisma.task.create({
    data: {
      studentId: student.id,
      day: parsed.data.day,
      subject: parsed.data.subject,
      title: parsed.data.title,
      duration: parsed.data.duration,
      sortOrder: (student.tasks[0]?.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
