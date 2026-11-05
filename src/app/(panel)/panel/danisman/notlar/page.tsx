"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type StudentOption = { id: string; name: string; grade: string };
type Note = { id: string; studentId: string; body: string; studentName: string; createdAt: string };

export default function AdvisorNotesPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [filterId, setFilterId] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetch("/api/panel/danisman/notlar")
      .then(async (response) => {
        if (!response.ok) {
          setError("Notları görmek için danışman hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { students: StudentOption[]; notes: Note[] };
        setStudents(data.students);
        setSaved(data.notes);
        const firstId = data.students[0]?.id ?? "";
        setStudentId(firstId);
        setFilterId(firstId);
      })
      .catch(() => setError("Notlar yüklenemedi."));
  }, []);

  async function save() {
    if (!note.trim() || !studentId) return;
    setError("");
    const response = await fetch("/api/panel/danisman/notlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, body: note }),
    });
    const data = (await response.json().catch(() => null)) as Note | { error?: string } | null;
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data ? data.error || "Not kaydedilemedi." : "Not kaydedilemedi.");
      return;
    }
    setSaved((prev) => [data, ...prev]);
    setFilterId(data.studentId);
    setNote("");
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError("");
    const response = await fetch("/api/panel/danisman/notlar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setDeletingId("");
    if (!response.ok) {
      setError(data?.error || "Not silinemedi.");
      return;
    }
    setSaved((prev) => prev.filter((item) => item.id !== id));
    setConfirmId("");
  }

  const visible = filterId ? saved.filter((item) => item.studentId === filterId) : saved;
  const filterName = students.find((student) => student.id === filterId)?.name;

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Seans Notları</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Not bir öğrenciye aittir. Filtrede o öğrenciyi seçince yalnızca onun notları durur.
        </p>
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <div className="grid gap-space-lg lg:grid-cols-2">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <label className="text-label-md font-semibold text-on-surface">
            Öğrenci seç
            <select
              className="input-field mt-1"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setFilterId(e.target.value);
              }}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.grade}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-space-md block text-label-md font-semibold text-on-surface">
            Not
            <textarea
              className="input-field mt-1 h-40 py-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Seans özeti, ev ödevi, risk notu..."
            />
          </label>
          <button type="button" onClick={save} className="btn-primary mt-space-md">
            <Icon name="save" className="text-[18px]" />
            Notu kaydet
          </button>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-space-sm">
            <h3 className="text-title-lg font-bold text-on-surface">Kayıtlı notlar</h3>
            <label className="text-label-md font-semibold text-on-surface">
              Filtre
              <select className="input-field mt-1" value={filterId} onChange={(event) => setFilterId(event.target.value)} aria-label="Not filtresi">
                <option value="">Tüm öğrenciler</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visible.length === 0 ? (
            <p className="mt-space-md text-body-sm text-on-surface-variant">
              {filterName ? `${filterName} için kayıtlı not yok.` : "Henüz kayıtlı not yok."}
            </p>
          ) : (
            <ul className="mt-space-md space-y-space-sm">
              {visible.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg bg-surface-container-low p-space-md text-body-sm text-on-surface"
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <p className="font-semibold">{item.studentName}</p>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-md font-semibold text-error"
                      disabled={deletingId === item.id}
                      onClick={() => setConfirmId(item.id)}
                    >
                      Sil
                    </button>
                  </div>
                  <p className="mt-1">{item.body}</p>
                  {confirmId === item.id ? (
                    <div className="mt-space-sm rounded-lg bg-surface-container-lowest px-space-sm py-space-sm ring-1 ring-error">
                      <p className="font-semibold text-error">Bu not silinsin mi?</p>
                      <div className="mt-space-sm flex gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-surface-container px-3 py-1.5 text-label-md font-semibold text-primary"
                          disabled={deletingId === item.id}
                          onClick={() => setConfirmId("")}
                        >
                          Vazgeç
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-error px-3 py-1.5 text-label-md font-semibold text-white"
                          disabled={deletingId === item.id}
                          onClick={() => void remove(item.id)}
                        >
                          {deletingId === item.id ? "Siliniyor…" : "Evet, sil"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
