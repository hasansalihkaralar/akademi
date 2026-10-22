import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { publishSite, shiftOrder } from "@/lib/site-content";
import { safeHref, slideSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (body && (body.move === "up" || body.move === "down")) {
    const slides = await prisma.slide.findMany();
    await shiftOrder(slides, id, body.move, (slideId, sortOrder) =>
      prisma.slide.update({ where: { id: slideId }, data: { sortOrder } }),
    );
    publishSite();
    const slide = await prisma.slide.findUnique({ where: { id } });
    return NextResponse.json(slide);
  }

  const parsed = slideSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Slayt bilgisi eksik." }, { status: 400 });
  const imageUrl = safeHref(parsed.data.imageUrl);
  if (!imageUrl) return NextResponse.json({ error: "Görsel adresi geçersiz." }, { status: 400 });
  const buttonHref = parsed.data.buttonHref ? safeHref(parsed.data.buttonHref) : "";
  if (parsed.data.buttonHref && !buttonHref) {
    return NextResponse.json({ error: "Buton adresi geçersiz." }, { status: 400 });
  }

  const slide = await prisma.slide.update({
    where: { id },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || "",
      imageUrl,
      buttonLabel: parsed.data.buttonLabel || "",
      buttonHref: buttonHref || "",
      visible: parsed.data.visible ?? true,
    },
  });
  publishSite();
  return NextResponse.json(slide);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const { id } = await context.params;
  await prisma.slide.delete({ where: { id } });
  publishSite();
  return NextResponse.json({ ok: true });
}
