import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { googleAuthUrl, googleConfigured, signGoogleState } from "@/lib/google";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  const back = new URL("/giris?rol=admin", request.url);
  if (!admin) return NextResponse.redirect(back);
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/panel/admin?google=ayar", request.url));
  }
  return NextResponse.redirect(googleAuthUrl(signGoogleState()));
}
