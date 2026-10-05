"use client";

import { useState } from "react";
import { CompareTable } from "@/components/CompareTable";
import { PackageCard } from "@/components/PackageCard";
import { Icon } from "@/components/Icon";
import { packages } from "@/lib/content";

export function PackagesView() {
  const [program, setProgram] = useState<"yks" | "lgs">("yks");
  const list = packages.filter((p) => p.program === program);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-40 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="shell relative py-space-2xl">
        <div className="mb-space-xl max-w-3xl">
          <nav className="mb-space-md text-label-md text-on-surface-variant">
            Ana Sayfa / <span className="text-primary">Paketler & Fiyatlar</span>
          </nav>
          <span className="section-badge">Şeffaf Fiyatlandırma</span>
          <h1 className="mt-space-sm text-display-hero-mobile text-on-surface md:text-headline-lg">
            YKS & LGS Koçluk Paketleri
          </h1>
          <p className="mt-space-md max-w-2xl text-body-lg text-on-surface-variant">
            Süre uzadıkça görüşme, günlük takip, veli paneli ve PDR seminerleri genişler.
            Paket satın almadan önce ücretsiz 15 dk ön görüşme ile seviye analizi yapılır;
            ardından sana uygun paket ve koç netleşir.
          </p>
        </div>

        <div className="mb-space-xl grid grid-cols-2 gap-space-sm md:grid-cols-4">
          {[
            ["verified", "PDR Onaylı Plan"],
            ["sync", "Koç Değişim Garantisi"],
            ["family_restroom", "Veli Raporlama"],
            ["analytics", "Deneme Analizi"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-sm"
            >
              <Icon name={icon} className="text-[20px] text-primary" />
              <span className="text-label-md font-semibold text-on-surface">{label}</span>
            </div>
          ))}
        </div>

        <div className="mb-space-xl inline-flex rounded-full bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setProgram("yks")}
            className={`rounded-full px-space-lg py-2.5 text-label-lg font-semibold transition ${
              program === "yks"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            YKS (TYT–AYT)
          </button>
          <button
            type="button"
            onClick={() => setProgram("lgs")}
            className={`rounded-full px-space-lg py-2.5 text-label-lg font-semibold transition ${
              program === "lgs"
                ? "bg-secondary-container text-on-secondary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            LGS (7–8. Sınıf)
          </button>
        </div>

        <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-4">
          {list.map((pack) => (
            <PackageCard key={pack.id} pack={pack} />
          ))}
        </div>

        <div className="mt-space-2xl">
          <h2 className="text-headline-md text-on-surface">Paket Karşılaştırma</h2>
          <p className="mt-space-xs text-body-md text-on-surface-variant">
            Fiyat, süre, görüşme ve veli takibini yan yana görün.
          </p>
          <div className="mt-space-lg">
            <CompareTable program={program} />
          </div>
        </div>
      </div>
    </div>
  );
}
