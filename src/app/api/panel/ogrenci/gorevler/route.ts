import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { taskToggleSchema } from "@/lib/validators";

async function profileFor(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { tasks: { orderBy: { sortOrder: "asc" } } },
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: { tasks: { orderBy: { sortOrder: "asc" } } },
    });
  }
  return null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const profile = await profileFor(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({
    tasks: profile.tasks.map((task) => ({
      id: task.id,
      day: task.day,
      subject: task.subject,
      title: task.title,
      duration: task.duration,
      done: task.done,
    })),
  });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ogrenci") {
    return NextResponse.json({ error: "Görevi yalnızca öğrenci güncelleyebilir." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = taskToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz görev." }, { status: 400 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı yok." }, { status: 404 });
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.id, studentId: profile.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Görev bulunamadı." }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { done: parsed.data.done },
  });

  return NextResponse.json({ id: updated.id, done: updated.done });
}
