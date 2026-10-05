"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getPackage, packages, formatPrice, type PackageId } from "@/lib/content";
import { Icon } from "./Icon";

const classesByProgram = {
  yks: ["11. sınıf", "12. sınıf", "Mezun"],
  lgs: ["7. sınıf", "8. sınıf"],
};

export function CheckoutForm({ initialPackageId }: { initialPackageId?: string }) {
  const router = useRouter();
  const [program, setProgram] = useState<"yks" | "lgs">(
    initialPackageId?.startsWith("lgs") ? "lgs" : "yks",
  );
  const [packageId, setPackageId] = useState<PackageId>(
    (getPackage(initialPackageId)?.id as PackageId) || "yks-6ay",
  );
  const [status, setStatus] = useState<"idle" | "3ds" | "error">("idle");
  const [kvkk, setKvkk] = useState(false);
  const [mesafeli, setMesafeli] = useState(false);
  const [riza, setRiza] = useState(false);

  const available = useMemo(
    () => packages.filter((p) => p.program === program),
    [program],
  );
  const selected = getPackage(packageId) ?? available[0];

  function onProgramChange(next: "yks" | "lgs") {
    setProgram(next);
    const first = packages.find((p) => p.program === next);
    if (first) setPackageId(first.id);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!kvkk || !mesafeli || !riza) {
      setStatus("error");
      return;
    }
    const form = new FormData(event.currentTarget);
    const card = String(form.get("card") || "").replace(/\s/g, "");
    const name = encodeURIComponent(String(form.get("studentName") || ""));
    setStatus("3ds");
    await new Promise((resolve) => setTimeout(resolve, 1600));
    if (card.endsWith("0000")) {
      router.push("/odeme/basarisiz");
      return;
    }
    router.push(`/odeme/basarili?paket=${selected.id}&ad=${name}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-space-lg rounded-2xl bg-surface-container-lowest p-space-xl shadow-md">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
            1
          </div>
          <h2 className="text-headline-sm text-on-surface">Öğrenci / Veli Bilgileri</h2>
        </div>
        <div className="grid gap-space-md md:grid-cols-2">
          <label className="text-label-md font-semibold text-on-surface">
            Öğrenci adı soyadı
            <input required name="studentName" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            Veli adı soyadı
            <input required name="parentName" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            Telefon
            <input required name="phone" type="tel" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            E-posta
            <input required name="email" type="email" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            Sınav
            <select
              className="input-field mt-1"
              value={program}
              onChange={(e) => onProgramChange(e.target.value as "yks" | "lgs")}
            >
              <option value="yks">YKS</option>
              <option value="lgs">LGS</option>
            </select>
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            Sınıf
            <select required name="grade" className="input-field mt-1">
              {classesByProgram[program].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-label-md font-semibold text-on-surface">
          Paket seçimi
          <select
            className="input-field mt-1"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value as PackageId)}
          >
            {available.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.name} — {formatPrice(pack.price)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-space-sm border-t border-outline-variant/40 pt-space-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-on-secondary">
            2
          </div>
          <h2 className="text-headline-sm text-on-surface">Kart ile Ödeme</h2>
        </div>
        <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface-variant">
          <Icon name="lock" className="text-[18px] text-primary" />
          Ödeme 3D Secure ile alınır. Demo ortamında gerçek tahsilat yapılmaz.
          Başarısız senaryo için kartı 0000 ile bitirin.
        </div>
        <div className="grid gap-space-md md:grid-cols-2">
          <label className="text-label-md font-semibold text-on-surface md:col-span-2">
            Kart üzerindeki isim
            <input required name="cardName" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface md:col-span-2">
            Kart numarası
            <input
              required
              name="card"
              inputMode="numeric"
              placeholder="**** **** **** ****"
              minLength={16}
              className="input-field mt-1"
            />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            Son kullanma
            <input required name="expiry" placeholder="AA/YY" className="input-field mt-1" />
          </label>
          <label className="text-label-md font-semibold text-on-surface">
            CVC
            <input required name="cvc" minLength={3} className="input-field mt-1" />
          </label>
        </div>

        <div className="space-y-space-sm rounded-xl bg-surface-container-low p-space-md text-body-sm">
          <label className="flex gap-2">
            <input type="checkbox" checked={mesafeli} onChange={(e) => setMesafeli(e.target.checked)} />
            <span>
              <a className="text-primary underline" href="/yasal/mesafeli-satis" target="_blank">
                Mesafeli satış sözleşmesini
              </a>{" "}
              okudum, onaylıyorum.
            </span>
          </label>
          <label className="flex gap-2">
            <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} />
            <span>
              <a className="text-primary underline" href="/yasal/kvkk" target="_blank">
                KVKK aydınlatma metnini
              </a>{" "}
              okudum.
            </span>
          </label>
          <label className="flex gap-2">
            <input type="checkbox" checked={riza} onChange={(e) => setRiza(e.target.checked)} />
            <span>
              <a className="text-primary underline" href="/yasal/acik-riza" target="_blank">
                Açık rıza metnini
              </a>{" "}
              onaylıyorum.
            </span>
          </label>
        </div>
        {status === "error" ? (
          <p className="text-body-sm text-error">Satın alma için yasal onay kutularını işaretleyin.</p>
        ) : null}
        <button type="submit" disabled={status === "3ds"} className="btn-primary w-full py-4 disabled:opacity-70">
          {status === "3ds" ? "3D Secure doğrulaması..." : "Ödemeyi Tamamla"}
        </button>
      </div>

      <aside className="h-fit rounded-2xl bg-primary p-space-xl text-on-primary shadow-xl">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary-fixed">
          Sipariş özeti
        </p>
        <h3 className="mt-space-sm text-headline-md">{selected.name}</h3>
        <p className="mt-1 text-body-sm text-primary-fixed">{selected.duration}</p>
        <p className="mt-space-md text-stat-counter">{formatPrice(selected.price)}</p>
        <ul className="mt-space-lg space-y-space-sm text-body-sm text-primary-fixed">
          <li className="flex gap-2">
            <Icon name="check" className="text-[18px] text-secondary-container" />
            {selected.meetings}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="text-[18px] text-secondary-container" />
            {selected.programPrep}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="text-[18px] text-secondary-container" />
            {selected.trialAnalysis}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="text-[18px] text-secondary-container" />
            {selected.tracking}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="text-[18px] text-secondary-container" />
            {selected.parentMeeting}
          </li>
        </ul>
      </aside>
    </form>
  );
}
