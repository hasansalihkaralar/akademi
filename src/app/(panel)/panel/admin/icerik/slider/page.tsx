"use client";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/panel/ImagePicker";

type SlideItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonLabel: string;
  buttonHref: string;
  visible: boolean;
};

const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary";

const empty = { title: "", subtitle: "", imageUrl: "", buttonLabel: "", buttonHref: "" };

export default function AdminSliderPage() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/panel/admin/icerik/slider")
      .then(async (response) => {
        if (!response.ok) {
          setError("Sliderı görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { slides: SlideItem[] };
        setSlides(data.slides);
      })
      .catch(() => setError("Slider yüklenemedi."));
  }

  useEffect(() => {
    load();
  }, []);

  async function createSlide(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/panel/admin/icerik/slider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, visible: true }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(data?.error || "Slayt eklenemedi.");
      return;
    }
    setDraft(empty);
    load();
  }

  async function save(slide: SlideItem) {
    setError("");
    const response = await fetch(`/api/panel/admin/icerik/slider/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slide),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) setError(data?.error || "Slayt kaydedilemedi.");
  }

  async function move(id: string, direction: "up" | "down") {
    await fetch(`/api/panel/admin/icerik/slider/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/panel/admin/icerik/slider/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((item) => item.id !== id));
  }

  function edit(id: string, patch: Partial<SlideItem>) {
    setSlides((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Slider</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Eklenen slaytlar ana sayfanın en üstünde görünür. Slayt yoksa ana sayfa olduğu gibi kalır.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <form onSubmit={createSlide} className="space-y-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="grid gap-space-sm md:grid-cols-2">
          <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Başlık" className={field} />
          <input value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} placeholder="Kısa açıklama" className={field} />
          <input value={draft.buttonLabel} onChange={(event) => setDraft({ ...draft, buttonLabel: event.target.value })} placeholder="Buton yazısı" className={field} />
          <input value={draft.buttonHref} onChange={(event) => setDraft({ ...draft, buttonHref: event.target.value })} placeholder="/on-gorusme" className={field} />
        </div>
        <ImagePicker value={draft.imageUrl} onChange={(imageUrl) => setDraft({ ...draft, imageUrl })} />
        <button type="submit" className="btn-primary">
          Slayt ekle
        </button>
      </form>
      <div className="space-y-space-md">
        {slides.map((slide, index) => (
          <article key={slide.id} className="space-y-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="grid gap-space-sm md:grid-cols-2">
              <input value={slide.title} onChange={(event) => edit(slide.id, { title: event.target.value })} className={field} />
              <input value={slide.subtitle} onChange={(event) => edit(slide.id, { subtitle: event.target.value })} className={field} />
              <input value={slide.buttonLabel} onChange={(event) => edit(slide.id, { buttonLabel: event.target.value })} placeholder="Buton yazısı" className={field} />
              <input value={slide.buttonHref} onChange={(event) => edit(slide.id, { buttonHref: event.target.value })} placeholder="Buton adresi" className={field} />
            </div>
            <ImagePicker value={slide.imageUrl} onChange={(imageUrl) => edit(slide.id, { imageUrl })} />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-label-md text-on-surface-variant">
                <input type="checkbox" checked={slide.visible} onChange={(event) => edit(slide.id, { visible: event.target.checked })} />
                Görünür
              </label>
              <button type="button" disabled={index === 0} onClick={() => move(slide.id, "up")} className="rounded-full bg-surface-container px-3 py-2 text-label-md">
                Yukarı
              </button>
              <button type="button" disabled={index === slides.length - 1} onClick={() => move(slide.id, "down")} className="rounded-full bg-surface-container px-3 py-2 text-label-md">
                Aşağı
              </button>
              <button type="button" onClick={() => save(slide)} className="rounded-full bg-primary px-3 py-2 text-label-md font-semibold text-on-primary">
                Kaydet
              </button>
              <button type="button" onClick={() => remove(slide.id)} className="rounded-full bg-surface-container px-3 py-2 text-label-md text-error">
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
