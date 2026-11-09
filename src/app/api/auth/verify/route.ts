import { NextResponse } from "next/server";
import { hashVerifyToken } from "@/lib/email-verification";
import { prisma } from "@/lib/db";

function redirectToLogin(request: Request, status: "ok" | "invalid" | "expired") {
  const origin = new URL(request.url).origin;
  const app = (process.env.APP_URL || origin).replace(/\/$/, "");
  const url = new URL(`${app}/giris`);
  if (status === "ok") url.searchParams.set("verified", "1");
  else url.searchParams.set("verify", status);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  if (!token) return redirectToLogin(request, "invalid");

  const tokenHash = hashVerifyToken(token);
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: tokenHash },
  });

  if (!user) return redirectToLogin(request, "invalid");
  if (user.emailVerifyExpires && user.emailVerifyExpires.getTime() < Date.now()) {
    return redirectToLogin(request, "expired");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return redirectToLogin(request, "ok");
}
