import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatPrice, getPackage } from "@/lib/content";

export const metadata: Metadata = { title: "Ödeme başarılı" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string; ad?: string }>;
}) {
  const params = await searchParams;
  const pack = getPackage(params.paket);
  const name = params.ad ? decodeURIComponent(params.ad) : "öğrencimiz";

  return (
    <div className="shell max-w-xl py-space-2xl text-center">
      <div className="mx-auto mb-space-lg flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <Icon name="check_circle" className="text-[40px]" />
      </div>
      <p className="text-label-lg font-bold uppercase tracking-wider text-secondary">
        Ödeme alındı
      </p>
      <h1 className="mt-space-sm text-headline-lg text-on-surface">Hoş geldin, {name}</h1>
      <p className="mt-space-md text-body-md leading-relaxed text-on-surface-variant">
        {pack
          ? `${pack.name} paketinin ödemesi (${formatPrice(pack.price)}) başarıyla kaydedildi.`
          : "Ödemen başarıyla kaydedildi."}{" "}
        Koç eşleştirmesi ve panel daveti e-posta ile gönderildi. 24 saat içinde ön görüşme
        için aranacaksın.
      </p>
      <div className="mt-space-xl flex justify-center gap-space-sm">
        <Link href="/kocluk" className="btn-navy">
          Süreci incele
        </Link>
        <Link href="/" className="btn-secondary">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
