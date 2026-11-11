import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasPendingTransfer } from "@/lib/payment-pending";
import { getSessionUser } from "@/lib/session";

async function profileFor(user: { id: string; role: string }) {
  if (user.role === "ogrenci") {
    return prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { trials: { orderBy: { sortOrder: "asc" } } },
    });
  }
  if (user.role === "veli") {
    return prisma.studentProfile.findFirst({
      where: { parentId: user.id },
      include: { trials: { orderBy: { sortOrder: "asc" } } },
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

  const hasPackage = Boolean(profile.packageId);
  const pendingTransfer = hasPackage ? false : await hasPendingTransfer(profile.id);

  return NextResponse.json({
    viewer: user.role,
    hasPackage,
    pendingTransfer,
    packageId: profile.packageId,
    trials: hasPackage
      ? profile.trials.map((trial) => ({
          id: trial.id,
          name: trial.name,
          date: trial.dateLabel,
          tyt: trial.tyt,
          ayt: trial.ayt,
          delta: trial.delta,
        }))
      : [],
  });
}
