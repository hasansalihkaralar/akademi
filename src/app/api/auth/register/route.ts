import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sessionCookieOptions, SESSION_COOKIE, signSession } from "@/lib/session";
import { publicStudentRegisterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = publicStudentRegisterSchema.safeParse(body);
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((issue) => issue.path[0] === "passwordConfirm");
    return NextResponse.json(
      { error: mismatch ? "Şifreler eşleşmiyor." : "Üyelik bilgilerini kontrol et." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const name = `${parsed.data.firstName} ${parsed.data.lastName}`.replace(/\s+/g, " ").trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." }, { status: 409 });
  }

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
        phone: parsed.data.phone,
        role: "ogrenci",
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        grade: "Belirtilmedi",
        program: "Belirtilmedi",
      },
    });

    return user;
  });

  const response = NextResponse.json(
    {
      user: { id: student.id, name: student.name, email: student.email, role: student.role },
    },
    { status: 201 },
  );
  response.cookies.set(SESSION_COOKIE, signSession(student.id, student.role), sessionCookieOptions);
  return response;
}
