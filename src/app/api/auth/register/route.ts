import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createVerifyToken } from "@/lib/email-verification";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { publicStudentRegisterSchema, safeHref } from "@/lib/validators";

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

  const { token, tokenHash, expiresAt } = createVerifyToken();

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
        phone: parsed.data.phone,
        role: "ogrenci",
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        emailVerifiedAt: null,
        emailVerifyToken: tokenHash,
        emailVerifyExpires: expiresAt,
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

  const nextRaw = typeof body?.next === "string" ? body.next : null;
  const nextPath = nextRaw && safeHref(nextRaw)?.startsWith("/") ? safeHref(nextRaw) : null;

  let mailWarning: string | null = null;
  try {
    await sendVerificationEmail(email, token, nextPath);
  } catch (error) {
    console.error("[register] verification mail failed", error);
    mailWarning =
      "Hesap oluşturuldu ama doğrulama maili gönderilemedi. Biraz sonra tekrar gönderiyi dene.";
  }

  return NextResponse.json(
    {
      needsVerification: true,
      email: student.email,
      message:
        mailWarning ||
        "Doğrulama maili gönderildi. Giriş yapmak için mailindeki linke tıkla.",
      mailWarning,
    },
    { status: 201 },
  );
}
