import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { OnGorusmeForm } from "@/components/OnGorusmeForm";
import { brand, getPackage, formatPrice } from "@/lib/content";

export const metadata: Metadata = { title: "Ücretsiz Ön Görüşme" };

export default async function OnGorusmePage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const params = await searchParams;
  const selected = getPackage(params.paket);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-40 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="shell relative py-space-2xl">
        <nav className="mb-space-md text-label-md text-on-surface-variant">
          Ana Sayfa /{" "}
          {selected ? (
            <>
              <Link href="/paketler" className="hover:text-primary">
                Paketler
              </Link>
              {" / "}
            </>
          ) : null}
          <span className="text-primary">Ücretsiz Ön Görüşme</span>
        </nav>

        <div className="grid gap-space-xl lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="section-badge">İlk adım</span>
            <h1 className="mt-space-sm page-title">
              Önce ücretsiz analiz, sonra paket
            </h1>
            <p className="mt-space-md text-body-lg text-on-surface-variant">
              Pusula Akademi&apos;de paket satın almadan önce 15 dakikalık ücretsiz ön görüşme
              yapılır. Seviye tespiti, hedef ve koç eşleştirmesi bu adımda netleşir.
            </p>

            {selected ? (
              <div className="mt-space-lg rounded-xl border border-primary/15 bg-surface-container-lowest p-space-lg shadow-sm">
                <p className="text-label-md font-bold uppercase tracking-wider text-secondary">
                  İlgi duyulan paket
                </p>
                <h2 className="mt-1 text-headline-sm text-primary">{selected.name}</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {selected.duration} · {formatPrice(selected.price)}
                </p>
                <p className="mt-space-sm text-body-sm text-on-surface-variant">
                  Ödeme, ön görüşme sonrası danışmanının yönlendirmesiyle açılır.
                </p>
              </div>
            ) : null}

            <ul className="mt-space-xl space-y-space-md">
              {[
                ["1", "Formu doldur", "Bilgilerin danışmanımıza iletilir."],
                ["2", "15 dk ücretsiz analiz", "Net, hedef ve çalışma ritmi konuşulur."],
                ["3", "Paket & koç önerisi", "Sana uygun paket ve mentör netleşir."],
                ["4", "Satın alma", "Karar sonrası güvenli ödeme sayfasına geçilir."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-space-md">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-fixed text-label-lg font-bold text-primary">
                    {n}
                  </span>
                  <div>
                    <p className="text-title-md font-bold text-on-surface">{t}</p>
                    <p className="text-body-sm text-on-surface-variant">{d}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-space-xl flex flex-wrap gap-space-sm">
              <a href={brand.whatsappHref} className="btn-secondary">
                <Icon name="chat" className="text-[18px]" />
                WhatsApp ile yaz
              </a>
              <Link href="/paketler" className="btn-secondary">
                Paketlere dön
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <OnGorusmeForm initialPackageId={params.paket} />
          </div>
        </div>
      </div>
    </div>
  );
}
