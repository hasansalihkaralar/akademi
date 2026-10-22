"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  exam: string | null;
  message: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/mesajlar")
      .then(async (response) => {
        if (!response.ok) {
          setError("Mesajları görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { items: Message[] };
        setItems(data.items);
      })
      .catch(() => setError("Mesajlar yüklenemedi."));
  }, []);

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">İletişim mesajları</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">Sitedeki iletişim formundan gelen yazılar.</p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="text-body-sm text-on-surface-variant">Henüz mesaj yok.</p>
      ) : null}
      <div className="space-y-space-sm">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <p className="font-semibold text-on-surface">{item.name}</p>
            <p className="text-body-sm text-on-surface-variant">
              {item.phone} · {item.email}
              {item.exam ? ` · ${item.exam}` : ""}
            </p>
            <p className="mt-space-sm text-body-sm text-on-surface">{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
