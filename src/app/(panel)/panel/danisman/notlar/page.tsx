"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type StudentOption = { id: string; name: string; grade: string };
type Note = { id: string; body: string; studentName: string; createdAt: string };

export default function AdvisorNotesPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<Note[]>([]);
  const [error, setError] = useState("");

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
        setStudentId(data.students[0]?.id ?? "");
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
    setNote("");
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Seans Notları</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Öğrenci bazlı notlar veritabanına kaydedilir ve bir sonraki seansta burada durur.
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
              onChange={(e) => setStudentId(e.target.value)}
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
          <h3 className="text-title-lg font-bold text-on-surface">Kayıtlı notlar</h3>
          {saved.length === 0 ? (
            <p className="mt-space-md text-body-sm text-on-surface-variant">
              Henüz kayıtlı not yok.
            </p>
          ) : (
            <ul className="mt-space-md space-y-space-sm">
              {saved.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg bg-surface-container-low p-space-md text-body-sm text-on-surface"
                >
                  <p className="font-semibold">{item.studentName}</p>
                  <p className="mt-1">{item.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
