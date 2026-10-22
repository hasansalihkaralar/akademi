"use client";

import Link from "next/link";
import { useState } from "react";
import { brand, getPackage, packages, formatPrice } from "@/lib/content";
import { Icon } from "./Icon";

export function OnGorusmeForm({ initialPackageId }: { initialPackageId?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState<string>(
    getPackage(initialPackageId)?.id ?? "",
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/on-gorusme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: form.get("studentName"),
        phone: form.get("phone"),
        email: form.get("email"),
        applicantRole: form.get("role"),
        exam: form.get("exam"),
        grade: form.get("grade"),
        packageId,
        struggle: form.get("struggle"),
        message: form.get("message"),
      }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Talep kaydedilemedi.");
      setLoading(false);
      return;
    }
    setSent(true);
  }

  if (sent) {
    const selected = getPackage(packageId);
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl">
        <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="check_circle" className="text-[28px]" />
        </div>
        <h3 className="text-headline-sm text-primary">Ön görüşme talebin alındı</h3>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          Danışmanımız aynı gün içinde seni arayacak. Ücretsiz 15 dk analiz sonrası sana uygun
          paket ve koç eşleştirmesi konuşulur.
          {selected ? (
            <>
              {" "}
              İlgi duyduğun paket: <strong>{selected.name}</strong> ({formatPrice(selected.price)}).
            </>
          ) : null}
        </p>
        <p className="mt-space-md text-body-sm text-on-surface-variant">
          Acil sorular için{" "}
          <a className="font-semibold text-primary underline" href={brand.whatsappHref}>
            WhatsApp
          </a>{" "}
          hattımız açık.
        </p>
        <Link href="/" className="btn-secondary mt-space-lg inline-flex">
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-space-md rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl"
    >
      <div>
        <h3 className="mb-space-xs text-headline-sm font-bold text-primary">
          Ücretsiz Ön Görüşme Formu
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Paket satın almadan önce 15 dakikalık ücretsiz analiz yapılır. Seviyen, hedefin ve
          uygun koç eşleştirmesi bu görüşmede netleşir.
        </p>
      </div>

      <div className="grid gap-space-md md:grid-cols-2">
        <label className="text-label-md font-semibold text-on-surface">
          Öğrenci adı soyadı <span className="text-secondary">*</span>
          <input
            required
            name="studentName"
            className="input-field mt-1"
            placeholder="Örn: Arda Yılmaz"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Telefon <span className="text-secondary">*</span>
          <input
            required
            name="phone"
            type="tel"
            className="input-field mt-1"
            placeholder="05XX XXX XX XX"
          />
        </label>
      </div>

      <div className="grid gap-space-md md:grid-cols-2">
        <label className="text-label-md font-semibold text-on-surface">
          E-posta <span className="text-secondary">*</span>
          <input
            required
            type="email"
            name="email"
            className="input-field mt-1"
            placeholder="ornek@mail.com"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Kim başvuruyor? <span className="text-secondary">*</span>
          <select required name="role" className="input-field mt-1">
            <option value="veli">Veli (Anne / Baba)</option>
            <option value="ogrenci">Öğrencinin Kendisi</option>
          </select>
        </label>
      </div>

      <div className="grid gap-space-md md:grid-cols-2">
        <label className="text-label-md font-semibold text-on-surface">
          Hedef sınav <span className="text-secondary">*</span>
          <select required name="exam" className="input-field mt-1">
            <option>YKS Sayısal</option>
            <option>YKS Eşit Ağırlık</option>
            <option>YKS Sözel / Dil</option>
            <option>LGS 8. Sınıf</option>
            <option>LGS 7. Sınıf</option>
          </select>
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Sınıf seviyesi <span className="text-secondary">*</span>
          <select required name="grade" className="input-field mt-1">
            <option>12. Sınıf</option>
            <option>Mezun</option>
            <option>11. Sınıf</option>
            <option>8. Sınıf</option>
            <option>7. Sınıf</option>
          </select>
        </label>
      </div>

      <label className="block text-label-md font-semibold text-on-surface">
        İlgi duyduğun paket (opsiyonel)
        <select
          name="packageInterest"
          className="input-field mt-1"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
        >
          <option value="">Henüz emin değilim — görüşmede konuşalım</option>
          {packages.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.name} ({pack.program.toUpperCase()}) — {formatPrice(pack.price)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-label-md font-semibold text-on-surface">
        En çok zorlandığın ders / konu
        <input
          name="struggle"
          className="input-field mt-1"
          placeholder="Örn: AYT Matematik, LGS yeni nesil paragraf"
        />
      </label>

      <label className="block text-label-md font-semibold text-on-surface">
        Kısa not
        <textarea
          name="message"
          rows={4}
          className="input-field mt-1 h-auto py-3"
          placeholder="Hedefin, mevcut netin veya sormak istediklerin..."
        />
      </label>

      <label className="flex items-start gap-2 text-body-sm text-on-surface-variant">
        <input required type="checkbox" className="mt-1 accent-primary" />
        <span>
          <Link href="/yasal/kvkk" className="text-primary underline" target="_blank">
            KVKK aydınlatma metnini
          </Link>{" "}
          okudum. Ön görüşme için aranmama izin veriyorum.
        </span>
      </label>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-primary w-full py-4 disabled:opacity-70">
        <Icon name="calendar_today" className="text-[20px]" />
        <span>{loading ? "Kaydediliyor..." : "Ücretsiz Ön Görüşmeyi Başlat"}</span>
      </button>
      <p className="text-center text-label-md text-on-surface-variant">
        Bilgilerin KVKK kapsamında gizli tutulur. Spam arama yapılmaz.
      </p>
    </form>
  );
}
