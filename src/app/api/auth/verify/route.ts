import { NextResponse } from "next/server";
import { hashVerifyToken } from "@/lib/email-verification";
import { prisma } from "@/lib/db";
import { safeHref } from "@/lib/validators";

function redirectToLogin(
  request: Request,
  status: "ok" | "invalid" | "expired",
  next?: string | null,
) {
  const origin = new URL(request.url).origin;
  const app = (process.env.APP_URL || origin).replace(/\/$/, "");
  const url = new URL(`${app}/giris`);
  if (status === "ok") url.searchParams.set("verified", "1");
  else url.searchParams.set("verify", status);
  const nextPath = next && safeHref(next);
  if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
    url.searchParams.set("next", nextPath.slice(0, 500));
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = params.get("token")?.trim() || "";
  const next = params.get("next");
  if (!token) return redirectToLogin(request, "invalid", next);

  const tokenHash = hashVerifyToken(token);
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: tokenHash },
  });

  if (!user) return redirectToLogin(request, "invalid", next);
  if (user.emailVerifyExpires && user.emailVerifyExpires.getTime() < Date.now()) {
    return redirectToLogin(request, "expired", next);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return redirectToLogin(request, "ok", next);
}
