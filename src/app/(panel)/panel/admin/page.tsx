"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Summary = {
  students: number;
  unassigned: number;
  advisors: number;
  requests: number;
  messages: number;
};

export default function AdminHomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [google, setGoogle] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [googleNote, setGoogleNote] = useState("");

  useEffect(() => {
    const flag = new URLSearchParams(window.location.search).get("google");
    if (flag === "ok") setGoogleNote("Google hesabı bağlandı. Yeni randevular Meet bağlantısı alır.");
    if (flag === "hata") setGoogleNote("Google bağlantısı tamamlanmadı. amfikocluk@gmail.com ile tekrar dene.");
    if (flag === "ayar") setGoogleNote("Google anahtarları ortam dosyasında yok.");
    fetch("/api/panel/admin/ozet")
      .then(async (response) => {
        if (!response.ok) {
          setError("Özeti görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        setSummary((await response.json()) as Summary);
      })
      .catch(() => setError("Özet yüklenemedi."));
    fetch("/api/google/status")
      .then(async (response) => {
        if (!response.ok) return;
        setGoogle((await response.json()) as { connected: boolean; email: string | null });
      })
      .catch(() => undefined);
  }, []);

  const cards = summary
    ? [
        ["Üye öğrenci", String(summary.students), "groups", "/panel/admin/ogrenciler"],
        ["Danışmanı olmayan", String(summary.unassigned), "person_off", "/panel/admin/ogrenciler"],
        ["Danışman", String(summary.advisors), "psychology", "/panel/admin/danismanlar"],
        ["Yeni talep", String(summary.requests), "inbox", "/panel/admin/talepler"],
        ["Okunmamış mesaj", String(summary.messages), "mail", "/panel/admin/mesajlar"],
      ]
    : [];

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Yönetim özeti</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Üye öğrencileri danışmanlara buradan ata. Ön görüşmeden gelen kişilere de üyelik açabilirsin.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {googleNote ? <p className="text-body-sm text-on-surface">{googleNote}</p> : null}
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h3 className="text-title-lg font-bold text-on-surface">Google Meet</h3>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {google?.connected
            ? `${google.email} bağlı. Danışman randevu yazınca Meet odası bu hesaptan açılır.`
            : "amfikocluk@gmail.com hesabını bir kez bağla. Sonraki randevuların Meet bağlantısı otomatik gelir."}
        </p>
        <a href="/api/google/connect" className="btn-primary mt-space-md">
          <Icon name="videocam" className="text-[18px]" />
          {google?.connected ? "Hesabı yeniden bağla" : "Google hesabını bağla"}
        </a>
      </section>
      <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, icon, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition hover:shadow-md"
          >
            <div className="mb-space-sm flex items-center justify-between">
              <p className="text-label-md text-on-surface-variant">{label}</p>
              <Icon name={icon} className="text-[22px] text-primary" />
            </div>
            <p className="text-headline-md font-extrabold text-primary">{value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h3 className="text-title-lg font-bold text-on-surface">Site içeriği</h3>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Logo, menü, ana sayfa sliderı ve görseller soldaki Site içeriği menüsünden yönetilir.
        </p>
        <div className="mt-space-md flex flex-wrap gap-2">
          {[
            ["/panel/admin/icerik/logo", "Logo"],
            ["/panel/admin/icerik/menu", "Menü"],
            ["/panel/admin/icerik/slider", "Slider"],
            ["/panel/admin/icerik/gorseller", "Görseller"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full bg-primary-fixed px-4 py-2 text-label-md font-semibold text-primary">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
