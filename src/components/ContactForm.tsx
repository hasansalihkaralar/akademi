"use client";

import { useState } from "react";
import { brand } from "@/lib/content";
import { Icon } from "./Icon";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/iletisim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        exam: form.get("exam"),
        applicantRole: form.get("role"),
        message: form.get("message"),
      }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Mesaj kaydedilemedi.");
      setLoading(false);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl">
        <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="check_circle" className="text-[28px]" />
        </div>
        <h3 className="text-headline-sm text-primary">Mesajın alındı</h3>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          En kısa sürede dönüş yapacağız. Acil sorular için WhatsApp hattımız açık.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-space-md rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl"
    >
      <div>
        <h3 className="mb-space-xs text-headline-sm font-bold text-primary">Bize Ulaşın</h3>
        <p className="text-body-sm text-on-surface-variant">
          Bilgilerini gir, danışmanımız aynı gün seninle irtibata geçsin.
        </p>
      </div>
      <div className="grid gap-space-md md:grid-cols-2">
        <label className="text-label-md font-semibold text-on-surface">
          Ad soyad <span className="text-secondary">*</span>
          <input required name="name" className="input-field mt-1" placeholder="Örn: Arda Yılmaz" />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Telefon <span className="text-secondary">*</span>
          <input required name="phone" className="input-field mt-1" placeholder="05XX XXX XX XX" />
        </label>
      </div>
      <label className="block text-label-md font-semibold text-on-surface">
        E-posta <span className="text-secondary">*</span>
        <input
          required
          type="email"
          name="email"
          className="input-field mt-1"
          placeholder="ornek@mail.com"
        />
      </label>
      <div className="grid gap-space-md md:grid-cols-2">
        <label className="text-label-md font-semibold text-on-surface">
          Hedef sınav
          <select name="exam" className="input-field mt-1">
            <option>YKS Sayısal</option>
            <option>YKS Eşit Ağırlık</option>
            <option>YKS Sözel / Dil</option>
            <option>LGS 8. Sınıf</option>
            <option>LGS 7. Sınıf</option>
          </select>
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Kim başvuruyor?
          <select name="role" className="input-field mt-1">
            <option>Öğrencinin Kendisi</option>
            <option>Veli (Anne / Baba)</option>
          </select>
        </label>
      </div>
      <label className="block text-label-md font-semibold text-on-surface">
        Mesaj <span className="text-secondary">*</span>
        <textarea
          required
          name="message"
          rows={5}
          className="input-field mt-1 h-auto py-3"
          placeholder="Kısaca hedefinizi ve sorularınızı yazın..."
        />
      </label>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-primary w-full py-4 disabled:opacity-70">
        <span>{loading ? "Gönderiliyor..." : "Mesaj Gönder"}</span>
        <Icon name="arrow_forward" className="text-[20px]" />
      </button>
      <p className="text-center text-label-md text-on-surface-variant">
        Dilersen doğrudan{" "}
        <a className="font-semibold text-primary underline" href={brand.whatsappHref}>
          WhatsApp
        </a>{" "}
        üzerinden de yazabilirsin.
      </p>
    </form>
  );
}
