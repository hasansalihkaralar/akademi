import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "Ödeme başarısız" };

export default function FailPage() {
  return (
    <div className="shell max-w-xl py-space-2xl text-center">
      <div className="mx-auto mb-space-lg flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
        <Icon name="error" className="text-[40px]" />
      </div>
      <p className="text-label-lg font-bold uppercase tracking-wider text-error">
        Ödeme tamamlanamadı
      </p>
      <h1 className="mt-space-sm text-headline-lg text-on-surface">
        3D Secure doğrulaması başarısız
      </h1>
      <p className="mt-space-md text-body-md leading-relaxed text-on-surface-variant">
        Kart bankası işlemi onaylamadı veya doğrulama iptal edildi. Bilgileri kontrol edip
        yeniden deneyebilir veya WhatsApp üzerinden destek isteyebilirsin. Hesabından çekim
        yapılmadı.
      </p>
      <div className="mt-space-xl flex justify-center gap-space-sm">
        <Link href="/odeme" className="btn-primary">
          Yeniden dene
        </Link>
        <a href={brand.whatsappHref} className="btn-secondary">
          WhatsApp destek
        </a>
      </div>
    </div>
  );
}
