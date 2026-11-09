import { NextResponse } from "next/server";
import { z } from "zod";
import { createVerifyToken, resendTooSoon } from "@/lib/email-verification";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Hesap varlığını sızdırmamak için genel başarı mesajı
  if (!user || user.role !== "ogrenci") {
    return NextResponse.json({
      ok: true,
      message: "Bu e-posta kayıtlıysa doğrulama maili gönderildi.",
    });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({
      ok: true,
      message: "Bu e-posta zaten doğrulanmış. Giriş yapabilirsin.",
      alreadyVerified: true,
    });
  }

  if (resendTooSoon(user.emailVerifyExpires)) {
    return NextResponse.json(
      { error: "Yeni mail için 1 dakika beklemen gerekir." },
      { status: 429 },
    );
  }

  const { token, tokenHash, expiresAt } = createVerifyToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: tokenHash,
      emailVerifyExpires: expiresAt,
    },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (error) {
    console.error("[resend-verification] mail failed", error);
    return NextResponse.json(
      { error: "Doğrulama maili gönderilemedi. SMTP ayarlarını kontrol et veya biraz sonra dene." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Doğrulama maili yeniden gönderildi. Gelen kutunu kontrol et.",
  });
}
