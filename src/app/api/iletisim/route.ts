import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form alanlarını kontrol et." }, { status: 400 });
  }

  const data = parsed.data;
  const created = await prisma.contactMessage.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email.toLowerCase(),
      exam: data.exam || null,
      applicantRole: data.applicantRole || null,
      message: data.message,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
