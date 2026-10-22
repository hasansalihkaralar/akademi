import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { assignAdvisorSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const [students, advisors] = await Promise.all([
    prisma.studentProfile.findMany({
      orderBy: { user: { name: "asc" } },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        advisor: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "danisman" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);

  return NextResponse.json({
    advisors,
    students: students.map((student) => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      program: student.program,
      advisorId: student.advisorId,
      advisorName: student.advisor?.name ?? null,
    })),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = assignAdvisorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Öğrenci ve danışman seçimi gerekli." }, { status: 400 });
  }

  if (parsed.data.advisorId) {
    const advisor = await prisma.user.findUnique({ where: { id: parsed.data.advisorId } });
    if (!advisor || advisor.role !== "danisman") {
      return NextResponse.json({ error: "Seçilen hesap danışman değil." }, { status: 400 });
    }
  }

  const student = await prisma.studentProfile.update({
    where: { id: parsed.data.id },
    data: { advisorId: parsed.data.advisorId },
    include: { advisor: { select: { name: true } } },
  });

  return NextResponse.json({
    id: student.id,
    advisorId: student.advisorId,
    advisorName: student.advisor?.name ?? null,
  });
}
