import { createHash, randomBytes } from "crypto";

export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export function hashVerifyToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createVerifyToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashVerifyToken(token);
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

/** Son gönderimden bu yana cooldown dolmadıysa true. */
export function resendTooSoon(expiresAt: Date | null | undefined, now = Date.now()) {
  if (!expiresAt) return false;
  const issuedAt = expiresAt.getTime() - VERIFY_TOKEN_TTL_MS;
  return now - issuedAt < RESEND_COOLDOWN_MS;
}
