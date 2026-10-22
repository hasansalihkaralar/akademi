import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { publishSite } from "@/lib/site-content";
import { safeHref, slideSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const slides = await prisma.slide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ slides });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = slideSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Slayt bilgisi eksik." }, { status: 400 });
  const imageUrl = safeHref(parsed.data.imageUrl);
  if (!imageUrl) return NextResponse.json({ error: "Görsel adresi geçersiz." }, { status: 400 });
  const buttonHref = parsed.data.buttonHref ? safeHref(parsed.data.buttonHref) : "";
  if (parsed.data.buttonHref && !buttonHref) {
    return NextResponse.json({ error: "Buton adresi geçersiz." }, { status: 400 });
  }

  const last = await prisma.slide.findFirst({ orderBy: { sortOrder: "desc" } });
  const slide = await prisma.slide.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || "",
      imageUrl,
      buttonLabel: parsed.data.buttonLabel || "",
      buttonHref: buttonHref || "",
      visible: parsed.data.visible ?? true,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });
  publishSite();
  return NextResponse.json(slide);
}
