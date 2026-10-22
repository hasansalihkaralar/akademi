import Link from "next/link";
import type { PublicAdvisor } from "@/lib/advisors";

export function CoachCard({ coach }: { coach: PublicAdvisor }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-xl">
      <div className={`relative flex h-48 items-end justify-center overflow-hidden bg-gradient-to-br ${coach.tone} pb-6`}>
        {coach.photoUrl ? (
          <img src={coach.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="text-5xl font-extrabold text-white/90">{coach.initials}</span>
        )}
      </div>
      <div className="flex flex-grow flex-col p-space-lg">
        <h3 className="text-title-lg font-bold text-on-surface">{coach.name}</h3>
        <p className="mb-space-lg text-body-sm font-semibold text-primary">{coach.title}</p>
        <Link
          href="/on-gorusme"
          className="mt-auto w-full rounded-lg bg-surface-container py-2.5 text-center text-label-md font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
        >
          Ön Görüşme Talep Et
        </Link>
      </div>
    </article>
  );
}
