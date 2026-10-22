import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { publishSite } from "@/lib/site-content";
import { brandSchema, safeHref } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const settings = await prisma.siteSetting.findMany();
  const map = new Map(settings.map((item) => [item.key, item.value]));
  return NextResponse.json({
    name: map.get("brandName") || "Amfi Koçluk",
    tagline: map.get("tagline") || "Hedefin Amfide",
    logoUrl: map.get("logoUrl") || "/logo.png",
  });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Logo bilgileri eksik." }, { status: 400 });
  const logoUrl = safeHref(parsed.data.logoUrl);
  if (!logoUrl) return NextResponse.json({ error: "Logo adresi geçersiz." }, { status: 400 });

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "brandName" },
      update: { value: parsed.data.name },
      create: { key: "brandName", value: parsed.data.name },
    }),
    prisma.siteSetting.upsert({
      where: { key: "tagline" },
      update: { value: parsed.data.tagline },
      create: { key: "tagline", value: parsed.data.tagline },
    }),
    prisma.siteSetting.upsert({
      where: { key: "logoUrl" },
      update: { value: logoUrl },
      create: { key: "logoUrl", value: logoUrl },
    }),
  ]);
  publishSite();
  return NextResponse.json({ name: parsed.data.name, tagline: parsed.data.tagline, logoUrl });
}
