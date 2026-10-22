import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { googleConnection, googleConfigured } from "@/lib/google";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yönetici oturumu gerekli." }, { status: 401 });
  }
  const connection = await googleConnection();
  return NextResponse.json({
    configured: googleConfigured(),
    connected: Boolean(connection),
    email: connection?.email ?? null,
  });
}
