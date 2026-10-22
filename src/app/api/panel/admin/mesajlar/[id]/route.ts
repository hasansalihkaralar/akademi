import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { read?: unknown } | null;
  if (!body || typeof body.read !== "boolean") {
    return NextResponse.json({ error: "Okundu bilgisi eksik." }, { status: 400 });
  }

  const item = await prisma.contactMessage.update({
    where: { id },
    data: { read: body.read },
  });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const { id } = await context.params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
