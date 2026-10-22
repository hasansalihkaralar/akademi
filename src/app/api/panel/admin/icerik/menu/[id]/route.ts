import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { publishSite, shiftOrder } from "@/lib/site-content";
import { navLinkSchema, safeHref } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (body && (body.move === "up" || body.move === "down")) {
    const links = await prisma.navLink.findMany();
    await shiftOrder(links, id, body.move, (linkId, sortOrder) =>
      prisma.navLink.update({ where: { id: linkId }, data: { sortOrder } }),
    );
    publishSite();
    const link = await prisma.navLink.findUnique({ where: { id } });
    return NextResponse.json(link);
  }

  const parsed = navLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Menü bilgisi eksik." }, { status: 400 });
  const href = safeHref(parsed.data.href);
  if (!href) return NextResponse.json({ error: "Bağlantı adresi geçersiz." }, { status: 400 });

  const link = await prisma.navLink.update({
    where: { id },
    data: {
      label: parsed.data.label,
      href,
      visible: parsed.data.visible ?? true,
    },
  });
  publishSite();
  return NextResponse.json(link);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const { id } = await context.params;
  await prisma.navLink.delete({ where: { id } });
  publishSite();
  return NextResponse.json({ ok: true });
}
