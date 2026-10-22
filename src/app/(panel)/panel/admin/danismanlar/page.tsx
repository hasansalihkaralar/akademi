"use client";

import { useEffect, useState } from "react";

type Advisor = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  studentCount: number;
};

export default function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/danismanlar")
      .then(async (response) => {
        if (!response.ok) {
          setError("Danışmanları görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { advisors: Advisor[] };
        setAdvisors(data.advisors);
      })
      .catch(() => setError("Danışman listesi yüklenemedi."));
  }, []);

  async function createAdvisor(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/panel/admin/danismanlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, title }),
    });
    const data = (await response.json().catch(() => null)) as Advisor | { error?: string } | null;
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data ? data.error || "Danışman eklenemedi." : "Danışman eklenemedi.");
      return;
    }
    setAdvisors((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "tr")));
    setName("");
    setEmail("");
    setPassword("");
    setTitle("");
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Danışmanlar</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Yeni danışman hesabı aç. Öğrenci ataması Öğrenciler ekranından yapılır.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <form
        onSubmit={createAdvisor}
        className="grid gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:grid-cols-2"
      >
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ad soyad"
          className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-posta"
          className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Giriş şifresi"
          className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ünvan (ör. YKS Sayısal Mentörü)"
          className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="btn-primary md:col-span-2">
          Danışman hesabı aç
        </button>
      </form>
      <div className="space-y-space-sm">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm"
          >
            <div>
              <p className="font-semibold text-on-surface">{advisor.name}</p>
              <p className="text-body-sm text-on-surface-variant">
                {advisor.title || "Danışman"} · {advisor.email}
              </p>
            </div>
            <p className="text-label-lg font-bold text-primary">{advisor.studentCount} öğrenci</p>
          </div>
        ))}
      </div>
    </div>
  );
}
