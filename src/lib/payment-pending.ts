import { prisma } from "@/lib/db";

/** Havale onayı bekleyen ödeme — paket kapısını kapatır. */
export async function hasPendingTransfer(studentId: string) {
  const row = await prisma.payment.findFirst({
    where: { studentId, status: "havale_bekliyor" },
    select: { id: true },
  });
  return Boolean(row);
}
