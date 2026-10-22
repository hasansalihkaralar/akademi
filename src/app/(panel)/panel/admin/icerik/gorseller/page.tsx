"use client";

import { useEffect, useState } from "react";
import type { LibraryImage } from "@/components/panel/ImagePicker";

export default function AdminMediaPage() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/panel/admin/icerik/gorseller")
      .then(async (response) => {
        if (!response.ok) {
          setError("Görselleri görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { images: LibraryImage[] };
        setImages(data.images);
      })
      .catch(() => setError("Görseller yüklenemedi."));
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/panel/admin/icerik/gorseller", { method: "POST", body });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(data?.error || "Görsel yüklenemedi.");
      return;
    }
    load();
  }

  async function remove(id: string) {
    await fetch("/api/panel/admin/icerik/gorseller", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setImages((prev) => prev.filter((image) => image.id !== id));
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Görseller</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Yüklenen görseller logo ve slider ekranlarında seçilebilir. PNG, JPG, WEBP veya GIF, en fazla 4 MB.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <label className="btn-primary w-fit cursor-pointer">
        Görsel yükle
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {images.length === 0 ? <p className="text-body-sm text-on-surface-variant">Henüz görsel yok.</p> : null}
      <div className="grid grid-cols-2 gap-space-md sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <article key={image.id} className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <img src={image.url} alt={image.alt || image.filename} className="h-36 w-full object-cover" />
            <div className="space-y-2 p-space-sm">
              <p className="truncate text-label-md text-on-surface-variant">{image.filename}</p>
              <button type="button" onClick={() => remove(image.id)} className="text-label-md font-semibold text-error">
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
