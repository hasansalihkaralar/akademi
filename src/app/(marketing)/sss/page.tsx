import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };

export default function FaqPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="shell relative py-space-2xl">
        <nav className="mb-space-md text-label-md text-on-surface-variant">
          Ana Sayfa / <span className="text-primary">S.S.S.</span>
        </nav>
        <span className="section-badge">Yardım Merkezi</span>
        <h1 className="mt-space-sm page-title">
          Sıkça sorulan sorular
        </h1>
        <p className="mt-space-md max-w-2xl text-body-lg text-on-surface-variant">
          Koçluk sistemi, görüşmeler, paketler ve iade koşulları hakkında merak edilenler.
        </p>

        <div className="mt-space-xl grid grid-cols-1 gap-space-sm sm:grid-cols-3">
          {[
            ["schedule", "Online görüşmeler"],
            ["swap_horiz", "Koç değişim hakkı"],
            ["receipt_long", "İade koşulları"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-sm"
            >
              <Icon name={icon} className="text-[20px] text-secondary" />
              <span className="text-label-md font-semibold text-on-surface">{label}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-space-2xl max-w-3xl">
          <FaqList />
        </div>
      </div>
    </div>
  );
}
