import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "pusula_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  sub: string;
  role: string;
  exp: number;
};

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

export function signSession(userId: string, role: string) {
  const payload: SessionPayload = { sub: userId, role, exp: Date.now() + WEEK_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.sub || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK_MS / 1000,
};

export async function getSessionUser() {
  const jar = await cookies();
  const payload = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, title: true, phone: true },
  });
}
