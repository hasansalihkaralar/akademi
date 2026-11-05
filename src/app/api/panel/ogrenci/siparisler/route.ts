import { NextResponse } from "next/server";
import { getPackage } from "@/lib/content";
import { prisma } from "@/lib/db";
import { formatTrDate, packageEndDate } from "@/lib/meeting-quota";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

async function profileFor(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }
  return null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ogrenci" && user.role !== "veli")) {
    return NextResponse.json({ error: "Öğrenci oturumu gerekli." }, { status: 401 });
  }

  const profile = await profileFor(user);
  if (!profile) {
    return NextResponse.json({ error: "Öğrenci kaydı bulunamadı." }, { status: 404 });
  }

  const now = Date.now();
  const orders = profile.payments.map((payment) => {
    const startedAt = payment.createdAt;
    const endsAt =
      payment.status === "odendi" ? packageEndDate(payment.packageId, startedAt) : null;
    const active =
      payment.status === "odendi" && endsAt ? endsAt.getTime() >= now : false;
    const pack = getPackage(payment.packageId);

    return {
      id: payment.id,
      packageId: payment.packageId,
      packageName: payment.packageName || pack?.name || payment.packageId,
      duration: pack?.duration || null,
      amount: payment.amount,
      status: payment.status,
      startedAt: startedAt.toISOString(),
      startedAtLabel: formatTrDate(startedAt),
      endsAt: endsAt?.toISOString() ?? null,
      endsAtLabel: endsAt ? formatTrDate(endsAt) : "—",
      active,
    };
  });

  const current = orders.find((order) => order.active) || null;
  const currentPack =
    current ||
    (profile.packageId && profile.packageStartedAt
      ? (() => {
          const endsAt = packageEndDate(profile.packageId, profile.packageStartedAt);
          const pack = getPackage(profile.packageId);
          return {
            id: "profile",
            packageId: profile.packageId,
            packageName: pack?.name || profile.packageId,
            duration: pack?.duration || null,
            amount: pack?.price ?? 0,
            status: "odendi",
            startedAt: profile.packageStartedAt.toISOString(),
            startedAtLabel: formatTrDate(profile.packageStartedAt),
            endsAt: endsAt?.toISOString() ?? null,
            endsAtLabel: endsAt ? formatTrDate(endsAt) : "—",
            active: endsAt ? endsAt.getTime() >= now : false,
          };
        })()
      : null);

  return NextResponse.json(
    {
      viewer: user.role,
      current: currentPack?.active ? currentPack : null,
      orders,
      canRepurchase: !currentPack?.active,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
