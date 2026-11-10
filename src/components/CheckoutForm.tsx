"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { bankTransfer, getPackage, packages, formatPrice, type PackageId } from "@/lib/content";
import { Icon } from "./Icon";

const classesByProgram = {
  yks: ["11. sınıf", "12. sınıf", "Mezun"],
  lgs: ["7. sınıf", "8. sınıf"],
};

type SessionStudent = {
  name: string;
  email: string;
  phone: string | null;
  grade: string;
  program: string;
};

type PayMethod = "kart" | "havale";

export function CheckoutForm({ initialPackageId }: { initialPackageId?: string }) {
  const router = useRouter();
  const [auth, setAuth] = useState<"loading" | "guest" | "student" | "other">("loading");
  const [student, setStudent] = useState<SessionStudent | null>(null);
  const [program, setProgram] = useState<"yks" | "lgs">(
    initialPackageId?.startsWith("lgs") ? "lgs" : "yks",
  );
  const [packageId, setPackageId] = useState<PackageId>(
    (getPackage(initialPackageId)?.id as PackageId) || "yks-6ay",
  );
  const [grade, setGrade] = useState("");
  const [method, setMethod] = useState<PayMethod>("kart");
  const [receiptName, setReceiptName] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "error" | "save" | "auth" | "receipt">("idle");
  const [saveError, setSaveError] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [mesafeli, setMesafeli] = useState(false);
  const [riza, setRiza] = useState(false);

  const returnTo = `/odeme${initialPackageId ? `?paket=${initialPackageId}` : ""}`;

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setAuth("guest");
          return;
        }
        const data = (await response.json()) as {
          user: { role: string; name: string; email: string; phone: string | null };
          profile?: { grade: string; program: string };
        };
        if (data.user.role !== "ogrenci") {
          setAuth("other");
          return;
        }
        setAuth("student");
        setStudent({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          grade: data.profile?.grade || "12. sınıf",
          program: data.profile?.program || "YKS Sayısal",
        });
        setGrade(
          data.profile?.grade && data.profile.grade !== "Belirtilmedi"
            ? data.profile.grade
            : classesByProgram.yks[1],
        );
        if (data.profile?.program?.toLowerCase().includes("lgs")) {
          setProgram("lgs");
        }
      })
      .catch(() => setAuth("guest"));
  }, []);

  const available = useMemo(
    () => packages.filter((p) => p.program === program),
    [program],
  );
  const selected = getPackage(packageId) ?? available[0];

  function onProgramChange(next: "yks" | "lgs") {
    setProgram(next);
    const first = packages.find((p) => p.program === next);
    if (first) setPackageId(first.id);
    setGrade(classesByProgram[next][0]);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth !== "student" || !student) {
      setStatus("auth");
      return;
    }
    if (!kvkk || !mesafeli || !riza) {
      setStatus("error");
      return;
    }

    const formEl = event.currentTarget;
    const form = new FormData(formEl);

    setSaveError("");
    if (method === "havale") {
      const receipt = form.get("receipt");
      if (!(receipt instanceof File) || receipt.size <= 0) {
        setStatus("receipt");
        return;
      }
      setStatus("busy");
      const body = new FormData();
      body.set("studentName", student.name);
      body.set("phone", student.phone || "05000000000");
      body.set("email", student.email);
      body.set("grade", grade || student.grade);
      body.set("packageId", selected.id);
      body.set("method", "havale");
      body.set("status", "havale_bekliyor");
      body.set("receipt", receipt);

      const response = await fetch("/api/odeme", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status === 401) {
        setStatus("auth");
        setAuth("guest");
        return;
      }
      if (!response.ok) {
        setSaveError(payload?.error || "Ödeme kaydedilemedi. Bilgileri kontrol edip yeniden dene.");
        setStatus("save");
        return;
      }
      router.push(
        `/odeme/basarili?paket=${selected.id}&ad=${encodeURIComponent(student.name)}&yontem=havale`,
      );
      return;
    }

    const card = String(form.get("card") || "").replace(/\s/g, "");
    setStatus("busy");
    const response = await fetch("/api/odeme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        studentName: student.name,
        phone: student.phone || "05000000000",
        email: student.email,
        grade: grade || student.grade,
        packageId: selected.id,
        method: "kart",
        status: card.endsWith("0000") ? "basarisiz" : "odendi",
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.status === 401) {
      setStatus("auth");
      setAuth("guest");
      return;
    }
    if (!response.ok) {
      setSaveError(payload?.error || "Ödeme kaydedilemedi. Bilgileri kontrol edip yeniden dene.");
      setStatus("save");
      return;
    }
    if (card.endsWith("0000")) {
      router.push("/odeme/basarisiz");
      return;
    }
    router.push(`/odeme/basarili?paket=${selected.id}&ad=${encodeURIComponent(student.name)}`);
  }

  if (auth === "loading") {
    return <p className="text-body-sm text-on-surface-variant">Oturum kontrol ediliyor…</p>;
  }

  if (auth === "guest" || auth === "other") {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md">
        <h2 className="text-headline-sm text-on-surface">Önce üye ol, sonra paket al</h2>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          {auth === "other"
            ? "Paket satın alma yalnızca öğrenci hesabıyla yapılabilir. Öğrenci hesabınla giriş yap."
            : "Paketi satın almadan önce öğrenci üyeliği oluşturman gerekir. Üye olduktan sonra bu sayfadan ödemeye devam edebilirsin."}
        </p>
        <div className="mt-space-lg flex flex-wrap gap-space-sm">
          <Link href={`/uye-ol?next=${encodeURIComponent(returnTo)}`} className="btn-primary">
            <Icon name="person_add" className="text-[18px]" />
            Üye ol
          </Link>
          <Link href={`/giris?next=${encodeURIComponent(returnTo)}`} className="btn-secondary">
            <Icon name="login" className="text-[18px]" />
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-space-lg rounded-2xl bg-surface-container-lowest p-space-xl shadow-md">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
            1
          </div>
          <h2 className="text-headline-sm text-on-surface">Hesap / paket bilgileri</h2>
        </div>
        <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface">
          <p className="font-semibold">{student?.name}</p>
          <p className="text-on-surface-variant">
            {student?.email}
            {student?.phone ? ` · ${student.phone}` : ""}
          </p>
        </div>
        <div className="grid gap-space-md md:grid-cols-2">
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
            <select required value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field mt-1">
              {classesByProgram[program].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-label-md font-semibold text-on-surface md:col-span-2">
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
        </div>

        <div className="flex items-center gap-space-sm border-t border-outline-variant/40 pt-space-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-on-secondary">
            2
          </div>
          <h2 className="text-headline-sm text-on-surface">Ödeme yöntemi</h2>
        </div>

        <div className="grid grid-cols-2 gap-space-sm rounded-xl bg-surface-container-low p-1.5">
          {(
            [
              ["kart", "Kart ile ödeme", "credit_card"],
              ["havale", "Havale / EFT", "account_balance"],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMethod(id);
                setStatus("idle");
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-label-md font-semibold transition ${
                method === id
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name={icon} className="text-[18px]" />
              {label}
            </button>
          ))}
        </div>

        {method === "kart" ? (
          <>
            <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface-variant">
              <Icon name="lock" className="text-[18px] text-primary" />
              Ödeme 3D Secure ile alınır. Demo ortamında gerçek tahsilat yapılmaz. Başarısız senaryo
              için kartı 0000 ile bitirin.
            </div>
            <div className="grid gap-space-md md:grid-cols-2">
              <label className="text-label-md font-semibold text-on-surface md:col-span-2">
                Kart üzerindeki isim
                <input required={method === "kart"} name="cardName" className="input-field mt-1" />
              </label>
              <label className="text-label-md font-semibold text-on-surface md:col-span-2">
                Kart numarası
                <input
                  required={method === "kart"}
                  name="card"
                  inputMode="numeric"
                  placeholder="**** **** **** ****"
                  minLength={16}
                  className="input-field mt-1"
                />
              </label>
              <label className="text-label-md font-semibold text-on-surface">
                Son kullanma
                <input
                  required={method === "kart"}
                  name="expiry"
                  placeholder="AA/YY"
                  className="input-field mt-1"
                />
              </label>
              <label className="text-label-md font-semibold text-on-surface">
                CVC
                <input required={method === "kart"} name="cvc" minLength={3} className="input-field mt-1" />
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface">
              <p className="text-label-md font-bold uppercase tracking-wider text-secondary">
                Banka bilgileri
              </p>
              <dl className="mt-space-md space-y-space-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-on-surface-variant">Banka</dt>
                  <dd className="font-semibold">{bankTransfer.bankName}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-on-surface-variant">Hesap sahibi</dt>
                  <dd className="font-semibold text-right">{bankTransfer.accountName}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-on-surface-variant">Şube</dt>
                  <dd className="font-semibold">{bankTransfer.branch}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-outline-variant/40 pt-space-sm">
                  <dt className="text-on-surface-variant">IBAN</dt>
                  <dd className="font-mono text-[13px] font-semibold tracking-wide">{bankTransfer.iban}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-on-surface-variant">Tutar</dt>
                  <dd className="font-semibold text-primary">{formatPrice(selected.price)}</dd>
                </div>
              </dl>
              <p className="mt-space-md text-body-sm text-on-surface-variant">
                {bankTransfer.descriptionHint}
              </p>
            </div>

            <label className="block text-label-md font-semibold text-on-surface">
              Dekont yükle
              <input
                required={method === "havale"}
                type="file"
                name="receipt"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="mt-2 block w-full text-body-sm text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-label-md file:font-semibold file:text-on-primary"
                onChange={(e) => setReceiptName(e.target.files?.[0]?.name || "")}
              />
              <span className="mt-1 block text-body-sm font-normal text-on-surface-variant">
                PDF, JPG veya PNG · en fazla 5 MB
                {receiptName ? ` · Seçilen: ${receiptName}` : ""}
              </span>
            </label>
          </>
        )}

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
        {status === "receipt" ? (
          <p className="text-body-sm text-error">Havale/EFT için dekont dosyası yüklemen gerekir.</p>
        ) : null}
        {status === "save" ? (
          <p className="text-body-sm text-error">
            {saveError || "Ödeme kaydedilemedi. Bilgileri kontrol edip yeniden dene."}
          </p>
        ) : null}
        {status === "auth" ? (
          <p className="text-body-sm text-error">Oturum gerekli. Öğrenci hesabınla giriş yapıp tekrar dene.</p>
        ) : null}
        <button type="submit" disabled={status === "busy"} className="btn-primary w-full py-4 disabled:opacity-70">
          {status === "busy"
            ? method === "havale"
              ? "Dekont gönderiliyor..."
              : "3D Secure doğrulaması..."
            : method === "havale"
              ? "Dekontu Gönder"
              : "Ödemeyi Tamamla"}
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
