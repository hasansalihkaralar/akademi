import type { Metadata } from "next";
import { CoachCard } from "@/components/CoachCard";
import { coaches } from "@/lib/content";

export const metadata: Metadata = { title: "Koçlarımız" };

export default function CoachesPage() {
  return (
    <div className="w-full">
      <section className="bg-gradient-to-b from-surface-container-low to-surface py-space-2xl">
        <div className="shell">
          <nav className="mb-space-md text-label-md text-on-surface-variant">
            Ana Sayfa / <span className="text-primary">Koçlarımız</span>
          </nav>
          <span className="section-badge">Dereceli Mentör Kadrosu</span>
          <h1 className="mt-space-sm text-display-hero-mobile text-on-surface md:text-headline-lg">
            Koçlarımız
          </h1>
          <p className="mt-space-md max-w-2xl text-body-lg text-on-surface-variant">
            Her koç ayrı ayrı tanıtılır; samimi, ulaşılabilir ve uzman. Eşleştirme ön
            görüşmede yapılır — sen tek başına seçmek zorunda değilsin.
          </p>
          <div className="mt-space-lg grid grid-cols-2 gap-space-sm md:grid-cols-4">
            {[
              ["4+", "Aktif Mentör"],
              ["%98", "Memnuniyet"],
              ["PDR", "Süpervizyon"],
              ["7/24", "Panel Takibi"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-lg bg-surface-container-lowest p-space-md text-center shadow-sm"
              >
                <p className="text-headline-sm font-extrabold text-primary">{v}</p>
                <p className="text-label-md text-on-surface-variant">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="shell pb-space-2xl">
        <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-4">
          {coaches.map((coach) => (
            <CoachCard key={coach.slug} coach={coach} />
          ))}
        </div>
      </section>
    </div>
  );
}
