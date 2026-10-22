"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  exam: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

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

  async function setRead(item: Message, read: boolean) {
    setError("");
    setBusyId(item.id);
    const response = await fetch(`/api/panel/admin/mesajlar/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setBusyId("");
    if (!response.ok) {
      setError("Mesaj güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, read } : row)));
  }

  async function remove(item: Message) {
    if (!window.confirm(`${item.name} mesajı silinsin mi?`)) return;
    setError("");
    setBusyId(item.id);
    const response = await fetch(`/api/panel/admin/mesajlar/${item.id}`, { method: "DELETE" });
    setBusyId("");
    if (!response.ok) {
      setError("Mesaj silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((row) => row.id !== item.id));
  }

  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">İletişim mesajları</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Sitedeki iletişim formundan gelen yazılar.
          {items.length > 0 ? ` ${unread} okunmamış.` : ""}
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="text-body-sm text-on-surface-variant">Henüz mesaj yok.</p>
      ) : null}
      <div className="space-y-space-sm">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl p-space-md shadow-sm ${
              item.read ? "bg-surface-container-lowest" : "bg-surface-container-lowest ring-2 ring-primary/30"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div>
                <p className="font-semibold text-on-surface">
                  {item.name}
                  {item.read ? null : (
                    <span className="ml-2 rounded-full bg-primary-fixed px-2 py-0.5 text-label-md font-semibold text-primary">
                      Yeni
                    </span>
                  )}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {item.phone} · {item.email}
                  {item.exam ? ` · ${item.exam}` : ""} · {formatWhen(item.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => setRead(item, !item.read)}
                  className="rounded-full bg-surface-container px-3 py-2 text-label-md font-semibold text-primary"
                >
                  {item.read ? "Okunmadı" : "Okundu"}
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => remove(item)}
                  className="rounded-full bg-surface-container px-3 py-2 text-label-md text-error"
                >
                  Sil
                </button>
              </div>
            </div>
            <p className="mt-space-sm text-body-sm text-on-surface">{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
