"use client";

import { useEffect, useState } from "react";

export type LibraryImage = {
  id: string;
  url: string;
  filename: string;
  alt: string;
};

export function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/panel/admin/icerik/gorseller")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { images: LibraryImage[] };
        setImages(data.images);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/panel/admin/icerik/gorseller", { method: "POST", body });
    const data = (await response.json().catch(() => null)) as LibraryImage & { error?: string } | null;
    if (!response.ok || !data?.url) {
      setError(data?.error || "Görsel yüklenemedi.");
      return;
    }
    setImages((prev) => [data, ...prev]);
    onChange(data.url);
  }

  return (
    <div className="space-y-space-sm">
      {value ? (
        <img src={value} alt="" className="h-24 w-40 rounded-lg bg-surface-container object-contain" />
      ) : (
        <p className="text-body-sm text-on-surface-variant">Henüz görsel seçilmedi.</p>
      )}
      <label className="inline-flex cursor-pointer items-center rounded-full bg-primary-fixed px-4 py-2 text-label-md font-semibold text-primary">
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
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onChange(image.url)}
              className={`overflow-hidden rounded-lg border-2 bg-surface-container ${
                value === image.url ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={image.url} alt={image.alt || image.filename} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
