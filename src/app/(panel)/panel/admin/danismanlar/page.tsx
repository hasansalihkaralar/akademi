"use client";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/panel/ImagePicker";

type AdvisorStudent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  grade: string;
  program: string;
  lastNet: number;
};

type Advisor = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  photoUrl: string | null;
  studentCount: number;
  students: AdvisorStudent[];
};

type Draft = {
  name: string;
  email: string;
  phone: string;
  title: string;
  password: string;
  photoUrl: string;
};

const emptyDraft: Draft = { name: "", email: "", phone: "", title: "", password: "", photoUrl: "" };

export default function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

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

  function startEdit(advisor: Advisor) {
    setError("");
    setEditingId(advisor.id);
    setDraft({
      name: advisor.name,
      email: advisor.email,
      phone: advisor.phone || "",
      title: advisor.title || "",
      password: "",
      photoUrl: advisor.photoUrl || "",
    });
  }

  async function saveAdvisor(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setError("");
    setSaving(true);
    const response = await fetch(`/api/panel/admin/danismanlar/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = (await response.json().catch(() => null)) as
      | (Pick<Advisor, "id" | "name" | "email" | "phone" | "title" | "photoUrl"> & { error?: string })
      | null;
    setSaving(false);
    if (!response.ok || !data || !data.id) {
      setError(data?.error || "Danışman güncellenemedi.");
      return;
    }
    setAdvisors((prev) =>
      prev
        .map((row) => (row.id === data.id ? { ...row, ...data } : row))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    );
    setEditingId(null);
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Danışmanlar</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Yeni danışman hesabı aç. Eklenen kişi Koçlarımız sayfasında ve ana sayfadaki mentör kadrosunda görünür.
          Fotoğraf ve bilgileri listedeki Düzenle ile güncellersin.
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
          <article
            key={advisor.id}
            className="rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                {advisor.photoUrl ? (
                  <img
                    src={advisor.photoUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-label-lg font-bold text-primary">
                    {advisor.name.slice(0, 1)}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-on-surface">{advisor.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {advisor.title || "Danışman"} · {advisor.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-md">
                <button
                  type="button"
                  onClick={() => (editingId === advisor.id ? setEditingId(null) : startEdit(advisor))}
                  className="rounded-full bg-surface-container px-3 py-2 text-label-md font-semibold text-primary"
                >
                  {editingId === advisor.id ? "Kapat" : "Düzenle"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId((current) => (current === advisor.id ? null : advisor.id))}
                  aria-expanded={openId === advisor.id}
                  className="text-label-lg font-bold text-primary underline-offset-2 hover:underline"
                >
                  {advisor.studentCount} öğrenci
                </button>
              </div>
            </div>
            {editingId === advisor.id ? (
              <form onSubmit={saveAdvisor} className="mt-space-md grid gap-space-sm md:grid-cols-2">
                <input
                  required
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ad soyad"
                  className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  placeholder="E-posta"
                  className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={draft.phone}
                  onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Telefon"
                  className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ünvan"
                  className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={draft.password}
                  onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Yeni şifre (boşsa değişmez)"
                  className="h-11 rounded-lg bg-surface-container-low px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary md:col-span-2"
                />
                <div className="md:col-span-2">
                  <p className="mb-2 text-label-md font-semibold text-on-surface">Mentör fotoğrafı</p>
                  <ImagePicker
                    value={draft.photoUrl}
                    onChange={(url) => setDraft((current) => ({ ...current, photoUrl: url }))}
                  />
                  {draft.photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, photoUrl: "" }))}
                      className="mt-2 text-label-md font-semibold text-error"
                    >
                      Fotoğrafı kaldır
                    </button>
                  ) : null}
                </div>
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2">
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            ) : null}
            {openId === advisor.id ? (
              advisor.students.length === 0 ? (
                <p className="mt-space-sm text-body-sm text-on-surface-variant">Bağlı öğrenci yok.</p>
              ) : (
                <ul className="mt-space-sm divide-y divide-outline-variant/40 rounded-lg bg-surface-container-low">
                  {advisor.students.map((student) => (
                    <li key={student.id} className="px-space-md py-2">
                      <p className="font-semibold text-on-surface">{student.name}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {student.grade} · {student.program}
                        {student.phone ? ` · ${student.phone}` : ""}
                        {student.email ? ` · ${student.email}` : ""}
                        {` · son net ${student.lastNet}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
