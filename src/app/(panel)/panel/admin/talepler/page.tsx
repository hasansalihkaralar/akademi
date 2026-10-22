"use client";

import { useEffect, useState } from "react";

type Advisor = { id: string; name: string };
type RequestItem = {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  exam: string;
  grade: string;
  status: string;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  yeni: "Yeni",
  gorusuldu: "Görüşüldü",
  uye: "Üye oldu",
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [advisorById, setAdvisorById] = useState<Record<string, string>>({});
  const [passwordById, setPasswordById] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/talepler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Talepleri görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { items: RequestItem[]; advisors: Advisor[] };
        setItems(data.items);
        setAdvisors(data.advisors);
      })
      .catch(() => setError("Talepler yüklenemedi."));
  }, []);

  async function setStatus(item: RequestItem, status: string) {
    setError("");
    const response = await fetch("/api/panel/admin/talepler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });
    if (!response.ok) {
      setError("Durum güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, status } : row)));
  }

  async function enroll(item: RequestItem) {
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/admin/talepler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: item.id,
        advisorId: advisorById[item.id] || null,
        password: passwordById[item.id] || "amfi1234",
      }),
    });
    const data = (await response.json().catch(() => null)) as { email?: string; error?: string } | null;
    if (!response.ok) {
      setError(data?.error || "Üyelik açılamadı.");
      return;
    }
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: "uye" } : row)));
    setNotice(`${data?.email} için öğrenci hesabı hazır. Şifre: ${passwordById[item.id] || "amfi1234"}`);
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Ön görüşme talepleri</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Görüşülen kişi üye olacaksa hesap aç ve danışmanını seç.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      <div className="space-y-space-sm">
        {items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Henüz talep yok.</p>
        ) : null}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div>
                <p className="font-semibold text-on-surface">{item.studentName}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {item.grade} · {item.exam} · {item.phone} · {item.email}
                </p>
              </div>
              <select
                className="h-10 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                value={item.status}
                onChange={(event) => setStatus(item, event.target.value)}
              >
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {item.status !== "uye" ? (
              <div className="mt-space-md grid gap-space-sm md:grid-cols-[1fr_180px_auto]">
                <select
                  className="h-10 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                  value={advisorById[item.id] ?? ""}
                  onChange={(event) =>
                    setAdvisorById((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                >
                  <option value="">Danışman sonra atanacak</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name}
                    </option>
                  ))}
                </select>
                <input
                  value={passwordById[item.id] ?? "amfi1234"}
                  onChange={(event) =>
                    setPasswordById((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                  className="h-10 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Geçici şifre"
                />
                <button type="button" className="btn-primary" onClick={() => enroll(item)}>
                  Üye kaydı aç
                </button>
              </div>
            ) : (
              <p className="mt-space-sm text-label-md font-semibold text-primary">Öğrenci hesabı açıldı.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
