import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { enrollSchema, requestStatusSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const [items, advisors] = await Promise.all([
    prisma.consultationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.user.findMany({
      where: { role: "danisman" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ items, advisors });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = requestStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Talep durumu güncellenemedi." }, { status: 400 });
  }

  const item = await prisma.consultationRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(item);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Üyelik bilgilerini kontrol et." }, { status: 400 });
  }

  const lead = await prisma.consultationRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!lead) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });

  if (parsed.data.advisorId) {
    const advisor = await prisma.user.findUnique({ where: { id: parsed.data.advisorId } });
    if (!advisor || advisor.role !== "danisman") {
      return NextResponse.json({ error: "Seçilen hesap danışman değil." }, { status: 400 });
    }
  }

  const email = lead.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (user && user.role !== "ogrenci") {
    return NextResponse.json({ error: "Bu e-posta başka bir hesap türünde kayıtlı." }, { status: 409 });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: lead.studentName,
        phone: lead.phone,
        role: "ogrenci",
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
  }

  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: { advisorId: parsed.data.advisorId, grade: lead.grade, program: lead.exam },
    create: {
      userId: user.id,
      advisorId: parsed.data.advisorId,
      grade: lead.grade,
      program: lead.exam,
    },
  });

  await prisma.consultationRequest.update({
    where: { id: lead.id },
    data: { status: "uye" },
  });

  return NextResponse.json({ email, name: user.name });
}
