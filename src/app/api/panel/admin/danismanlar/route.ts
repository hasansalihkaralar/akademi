import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createAdvisorSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const advisors = await prisma.user.findMany({
    where: { role: "danisman" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      title: true,
      advised: {
        orderBy: { user: { name: "asc" } },
        select: {
          id: true,
          grade: true,
          program: true,
          lastNet: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  return NextResponse.json({
    advisors: advisors.map((advisor) => ({
      id: advisor.id,
      name: advisor.name,
      email: advisor.email,
      phone: advisor.phone,
      title: advisor.title,
      studentCount: advisor.advised.length,
      students: advisor.advised.map((student) => ({
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        grade: student.grade,
        program: student.program,
        lastNet: student.lastNet,
      })),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createAdvisorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ad, e-posta ve şifre gerekli." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }

  const advisor = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "danisman",
      title: parsed.data.title || "Danışman",
      phone: parsed.data.phone || null,
    },
    select: { id: true, name: true, email: true, phone: true, title: true },
  });

  return NextResponse.json({ ...advisor, studentCount: 0, students: [] }, { status: 201 });
}
