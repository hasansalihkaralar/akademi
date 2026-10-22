import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getSiteContent, publishSite } from "@/lib/site-content";
import { navLinkSchema, safeHref } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  await getSiteContent();
  const links = await prisma.navLink.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = navLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Menü bilgisi eksik." }, { status: 400 });
  const href = safeHref(parsed.data.href);
  if (!href) return NextResponse.json({ error: "Bağlantı adresi geçersiz." }, { status: 400 });

  const last = await prisma.navLink.findFirst({ orderBy: { sortOrder: "desc" } });
  const link = await prisma.navLink.create({
    data: {
      label: parsed.data.label,
      href,
      visible: parsed.data.visible ?? true,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });
  publishSite();
  return NextResponse.json(link);
}
