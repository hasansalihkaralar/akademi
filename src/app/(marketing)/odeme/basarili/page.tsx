import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/PaymentSuccess";
import { formatPrice, getPackage } from "@/lib/content";

export const metadata: Metadata = { title: "Ödeme başarılı" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string; ad?: string; yontem?: string }>;
}) {
  const params = await searchParams;
  const pack = getPackage(params.paket);
  const name = params.ad ? decodeURIComponent(params.ad) : "değerli öğrencimiz";
  const method = params.yontem === "havale" ? "havale" : "kart";
  const packageLine = pack
    ? `${pack.name} (${formatPrice(pack.price)}) için işlemin kaydedildi.`
    : "Paket işlemin kaydedildi.";

  return <PaymentSuccess name={name} packageLine={packageLine} method={method} />;
}
