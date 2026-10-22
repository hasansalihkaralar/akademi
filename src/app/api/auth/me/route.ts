import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
  }

  if (user.role === "admin") {
    const [students, openRequests] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.consultationRequest.count({ where: { status: "yeni" } }),
    ]);
    return NextResponse.json({
      user,
      subtitle: `${students} öğrenci · ${openRequests} yeni talep`,
    });
  }

  if (user.role === "ogrenci" || user.role === "veli") {
    const profile =
      user.role === "ogrenci"
        ? await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: { advisor: { select: { name: true } }, user: { select: { name: true } } },
          })
        : await prisma.studentProfile.findFirst({
            where: { parentId: user.id },
            include: { advisor: { select: { name: true } }, user: { select: { name: true } } },
          });

    return NextResponse.json({
      user,
      subtitle: profile
        ? `${profile.grade} · ${profile.program} · Koç: ${profile.advisor?.name ?? "atanmadı"}`
        : "Öğrenci kaydı yok",
    });
  }

  const count = await prisma.studentProfile.count({ where: { advisorId: user.id } });
  return NextResponse.json({
    user,
    subtitle: `${user.title ?? "Danışman"} · ${count} aktif öğrenci`,
  });
}
