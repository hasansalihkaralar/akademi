"use client";

import { useEffect, useState } from "react";

type LinkItem = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
};

const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary";

export default function AdminMenuPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/panel/admin/icerik/menu")
      .then(async (response) => {
        if (!response.ok) {
          setError("Menüyü görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { links: LinkItem[] };
        setLinks(data.links);
      })
      .catch(() => setError("Menü yüklenemedi."));
  }

  useEffect(() => {
    load();
  }, []);

  async function createLink(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/panel/admin/icerik/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, visible: true }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(data?.error || "Menü öğesi eklenemedi.");
      return;
    }
    setLabel("");
    setHref("");
    load();
  }

  async function save(link: LinkItem) {
    setError("");
    const response = await fetch(`/api/panel/admin/icerik/menu/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: link.label, href: link.href, visible: link.visible }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) setError(data?.error || "Menü kaydedilemedi.");
  }

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/panel/admin/icerik/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/panel/admin/icerik/menu/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((item) => item.id !== id));
  }

  function edit(id: string, patch: Partial<LinkItem>) {
    setLinks((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Menü</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Üst menüdeki bağlantılar. Gizlenen öğe sitede görünmez.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <form onSubmit={createLink} className="grid gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:grid-cols-[1fr_1fr_auto]">
        <input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Menü adı" className={field} />
        <input required value={href} onChange={(event) => setHref(event.target.value)} placeholder="/paketler" className={field} />
        <button type="submit" className="btn-primary">
          Ekle
        </button>
      </form>
      <div className="space-y-space-sm">
        {links.map((link, index) => (
          <div key={link.id} className="grid items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:grid-cols-[1fr_1fr_auto]">
            <input value={link.label} onChange={(event) => edit(link.id, { label: event.target.value })} className={field} />
            <input value={link.href} onChange={(event) => edit(link.id, { href: event.target.value })} className={field} />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-label-md text-on-surface-variant">
                <input type="checkbox" checked={link.visible} onChange={(event) => edit(link.id, { visible: event.target.checked })} />
                Görünür
              </label>
              <button type="button" disabled={index === 0} onClick={() => move(link.id, "up")} className="rounded-full bg-surface-container px-3 py-2 text-label-md">
                Yukarı
              </button>
              <button type="button" disabled={index === links.length - 1} onClick={() => move(link.id, "down")} className="rounded-full bg-surface-container px-3 py-2 text-label-md">
                Aşağı
              </button>
              <button type="button" onClick={() => save(link)} className="rounded-full bg-primary px-3 py-2 text-label-md font-semibold text-on-primary">
                Kaydet
              </button>
              <button type="button" onClick={() => remove(link.id)} className="rounded-full bg-surface-container px-3 py-2 text-label-md text-error">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
