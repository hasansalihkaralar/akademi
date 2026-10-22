import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { updateAdvisorSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

function photoUrlOf(value: string) {
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith("/uploads/") && !url.includes("..") && !url.includes("\\")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {
    return undefined;
  }
  return undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateAdvisorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ad ve e-posta gerekli." }, { status: 400 });
  }

  const current = await prisma.user.findUnique({ where: { id } });
  if (!current || current.role !== "danisman") {
    return NextResponse.json({ error: "Danışman bulunamadı." }, { status: 404 });
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== current.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }

  const photoUrl = photoUrlOf(parsed.data.photoUrl || "");
  if (photoUrl === undefined) {
    return NextResponse.json({ error: "Fotoğraf adresi geçersiz." }, { status: 400 });
  }

  const advisor = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email,
      title: parsed.data.title || "Danışman",
      phone: parsed.data.phone || null,
      photoUrl,
      ...(parsed.data.password
        ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) }
        : {}),
    },
    select: { id: true, name: true, email: true, phone: true, title: true, photoUrl: true },
  });

  return NextResponse.json(advisor);
}
