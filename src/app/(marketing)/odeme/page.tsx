import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="w-full bg-surface-container-low/40 py-space-2xl">
      <div className="shell">
        <nav className="mb-space-md text-label-md text-on-surface-variant">
          Ana Sayfa / Paketler / <span className="text-primary">Ödeme</span>
        </nav>
        <div className="mb-space-xl flex flex-col gap-space-md md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface">Satın Alma</h1>
            <p className="mt-space-sm max-w-2xl text-body-md text-on-surface-variant">
              Bu sayfa, ücretsiz ön görüşme sonrası paket kararını vermiş öğrenciler içindir.
              Henüz görüşme yapmadıysan önce{" "}
              <a href="/on-gorusme" className="font-semibold text-primary underline">
                ön görüşme formunu
              </a>{" "}
              doldur.
            </p>
          </div>
          <div className="flex items-center gap-space-xs rounded-full bg-surface-container-lowest px-space-md py-space-sm text-label-md font-semibold text-primary shadow-sm">
            <Icon name="verified_user" className="text-[18px]" />
            256-bit SSL · 3D Secure
          </div>
        </div>

        <div className="mb-space-xl flex flex-wrap items-center gap-space-sm text-label-md">
          {(
            [
              { n: "1", label: "Paket Seçimi", active: true },
              { n: "2", label: "Bilgiler", active: true },
              { n: "3", label: "Ödeme", active: true },
              { n: "4", label: "Onay", active: false },
            ] as const
          ).map((step, i) => (
            <div key={step.label} className="flex items-center gap-space-sm">
              {i > 0 ? <span className="text-outline-variant">—</span> : null}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-label-md font-bold ${
                  step.active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {step.n}
              </span>
              <span
                className={
                  step.active ? "font-semibold text-on-surface" : "text-on-surface-variant"
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <CheckoutForm initialPackageId={params.paket} />
      </div>
    </div>
  );
}
