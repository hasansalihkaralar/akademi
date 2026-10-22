import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const [students, unassigned, advisors, requests, messages] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.studentProfile.count({ where: { advisorId: null } }),
    prisma.user.count({ where: { role: "danisman" } }),
    prisma.consultationRequest.count({ where: { status: "yeni" } }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ students, unassigned, advisors, requests, messages });
}
