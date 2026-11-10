import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isPanelRole } from "@/lib/panel-home";
import { sessionCookieOptions, SESSION_COOKIE, signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  if (!isPanelRole(user.role)) {
    return NextResponse.json({ error: "Bu hesap giriş için aktif değil." }, { status: 403 });
  }

  if (user.role === "ogrenci" && !user.emailVerifiedAt) {
    return NextResponse.json(
      {
        error: "Önce e-posta adresini doğrula. Mailindeki bağlantıya tıkla veya doğrulama mailini yeniden gönder.",
        needsVerification: true,
        email: user.email,
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, signSession(user.id, user.role), sessionCookieOptions);
  return response;
}
