import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { googleConnection, googleConfigured, googleTokenHealthy } from "@/lib/google";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yönetici oturumu gerekli." }, { status: 401 });
  }
  const connection = await googleConnection();
  const health = connection ? await googleTokenHealthy() : { healthy: false, error: "Google hesabı bağlı değil." };
  return NextResponse.json({
    configured: googleConfigured(),
    connected: Boolean(connection),
    healthy: health.healthy,
    email: connection?.email ?? null,
    error: health.healthy ? null : health.error,
  });
}
