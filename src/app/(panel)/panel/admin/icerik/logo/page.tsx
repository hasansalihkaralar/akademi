"use client";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/panel/ImagePicker";

const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary";

export default function AdminLogoPage() {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/icerik/marka")
      .then(async (response) => {
        if (!response.ok) {
          setError("Logo ayarını görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { name: string; tagline: string; logoUrl: string };
        setName(data.name);
        setTagline(data.tagline);
        setLogoUrl(data.logoUrl);
      })
      .catch(() => setError("Logo ayarı yüklenemedi."));
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved("");
    const response = await fetch("/api/panel/admin/icerik/marka", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tagline, logoUrl }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(data?.error || "Logo kaydedilemedi.");
      return;
    }
    window.dispatchEvent(new Event("site-content"));
    setSaved("Logo kaydedildi. Sitede bir sonraki sayfa açılışında görünür.");
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Logo</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Üst menüdeki logo, marka adı ve kısa slogan buradan değişir.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {saved ? <p className="text-body-sm text-primary">{saved}</p> : null}
      <form onSubmit={save} className="max-w-xl space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Marka adı" className={`${field} w-full`} />
        <input required value={tagline} onChange={(event) => setTagline(event.target.value)} placeholder="Slogan" className={`${field} w-full`} />
        <ImagePicker value={logoUrl} onChange={setLogoUrl} />
        <button type="submit" className="btn-primary">
          Logoyu kaydet
        </button>
      </form>
    </div>
  );
}
