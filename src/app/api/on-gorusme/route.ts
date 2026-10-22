import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { consultationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form alanlarını kontrol et." }, { status: 400 });
  }

  const data = parsed.data;
  const created = await prisma.consultationRequest.create({
    data: {
      studentName: data.studentName,
      phone: data.phone,
      email: data.email.toLowerCase(),
      applicantRole: data.applicantRole,
      exam: data.exam,
      grade: data.grade,
      packageId: data.packageId || null,
      struggle: data.struggle || null,
      message: data.message || null,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "danisman") {
    return NextResponse.json({ error: "Bu liste yalnızca danışmanlara açık." }, { status: 403 });
  }

  const items = await prisma.consultationRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items });
}
