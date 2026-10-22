"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  exam: string;
  grade: string;
  packageId: string | null;
  status: string;
  createdAt: string;
};

export default function ConsultationRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/on-gorusme")
      .then(async (response) => {
        if (!response.ok) {
          setError("Talepleri görmek için danışman hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { items: RequestItem[] };
        setItems(data.items);
      })
      .catch(() => setError("Talepler yüklenemedi."));
  }, []);

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Ön Görüşme Talepleri</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Siteden gelen ücretsiz analiz formları burada listelenir.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="text-body-sm text-on-surface-variant">Henüz kayıtlı talep yok.</p>
      ) : null}
      <div className="space-y-space-sm">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">{item.studentName}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {item.grade} · {item.exam}
                  {item.packageId ? ` · ${item.packageId}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-primary-fixed px-3 py-1 text-label-md font-bold text-primary">
                {item.status}
              </span>
            </div>
            <p className="mt-space-sm text-body-sm text-on-surface">
              {item.phone} · {item.email}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
