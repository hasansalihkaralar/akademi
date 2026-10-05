import Link from "next/link";
import { type CoachingPackage, formatPrice } from "@/lib/content";
import { Icon } from "./Icon";

export function PackageCard({ pack }: { pack: CoachingPackage }) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-xl bg-surface-container-lowest p-space-lg shadow-md transition-shadow hover:shadow-xl ${
        pack.popular ? "ring-2 ring-secondary-container" : ""
      }`}
    >
      {pack.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-secondary-container px-3 py-1 text-label-md font-bold text-on-secondary shadow-sm">
          En Çok Tercih Edilen
        </span>
      ) : null}
      <p className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
        {pack.duration}
      </p>
      <h3 className="mt-space-xs text-headline-sm text-on-surface">{pack.name}</h3>
      <div className="mt-space-md">
        {pack.oldPrice ? (
          <p className="text-body-sm text-on-surface-variant line-through">
            {formatPrice(pack.oldPrice)}
          </p>
        ) : null}
        <p className="text-stat-counter text-primary">{formatPrice(pack.price)}</p>
      </div>
      <ul className="mt-space-lg flex-1 space-y-space-sm text-body-sm text-on-surface-variant">
        {[pack.meetings, pack.programPrep, pack.trialAnalysis, pack.tracking, pack.parentMeeting].map(
          (item) => (
            <li key={item} className="flex items-start gap-space-xs">
              <Icon name="check_circle" className="mt-0.5 shrink-0 text-[18px] text-secondary" />
              <span>{item}</span>
            </li>
          ),
        )}
        {pack.extras.map((extra) => (
          <li key={extra} className="flex items-start gap-space-xs text-primary">
            <Icon name="add_circle" className="mt-0.5 shrink-0 text-[18px]" />
            <span>{extra}</span>
          </li>
        ))}
      </ul>
      <div className="mt-space-lg space-y-space-sm">
        <Link
          href={`/on-gorusme?paket=${pack.id}`}
          className={`block w-full text-center ${pack.popular ? "btn-primary" : "btn-navy"}`}
        >
          Ücretsiz Ön Görüşme Talep Et
        </Link>
        <p className="text-center text-label-md text-on-surface-variant">
          Önce 15 dk analiz yapılır; ödeme görüşme sonrasındadır.
        </p>
        <Link
          href={`/odeme?paket=${pack.id}`}
          className="block text-center text-label-md font-semibold text-primary underline-offset-2 hover:underline"
        >
          Ön görüşme yaptım, satın al →
        </Link>
      </div>
    </article>
  );
}
