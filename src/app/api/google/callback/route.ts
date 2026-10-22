import { NextResponse } from "next/server";
import { saveGoogleCode, verifyGoogleState } from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = new URL("/panel/admin", url.origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error") || !code || !verifyGoogleState(state)) {
    back.searchParams.set("google", "hata");
    return NextResponse.redirect(back);
  }

  const email = await saveGoogleCode(code).catch(() => null);
  back.searchParams.set("google", email ? "ok" : "hata");
  return NextResponse.redirect(back);
}
