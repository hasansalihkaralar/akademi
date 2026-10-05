import Link from "next/link";
import { coaches } from "@/lib/content";

export function CoachCard({
  coach,
}: {
  coach: (typeof coaches)[number];
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-xl">
      <div className={`relative flex h-52 items-end justify-center bg-gradient-to-br ${coach.tone} pb-6`}>
        <span className="text-5xl font-extrabold text-white/90">{coach.initials}</span>
        <div className="absolute left-3 top-3 rounded-full bg-primary px-space-sm py-1 text-label-md font-bold text-on-primary shadow-sm">
          {coach.degree}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-space-sm py-1 text-label-md font-semibold text-on-surface backdrop-blur">
          <span className="text-secondary-container">★</span>
          <span>4.9 / 5.0</span>
        </div>
      </div>
      <div className="flex flex-grow flex-col p-space-lg">
        <h3 className="text-title-lg font-bold text-on-surface">{coach.name}</h3>
        <p className="mb-space-sm text-body-sm font-semibold text-primary">{coach.title}</p>
        <div className="mb-space-md flex flex-wrap gap-1">
          <span className="rounded bg-surface-container px-2 py-0.5 text-label-md text-on-surface-variant">
            {coach.uni}
          </span>
          <span className="rounded bg-surface-container px-2 py-0.5 text-label-md text-on-surface-variant">
            {coach.group.split(",")[0]}
          </span>
        </div>
        <p className="mb-space-md text-body-sm text-on-surface-variant">{coach.bio}</p>
        <dl className="mb-space-lg space-y-1 text-body-sm">
          <div>
            <dt className="text-on-surface-variant">Uzmanlık</dt>
            <dd className="font-semibold text-on-surface">{coach.expertise}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Deneyim</dt>
            <dd className="font-semibold text-on-surface">{coach.experience}</dd>
          </div>
        </dl>
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
