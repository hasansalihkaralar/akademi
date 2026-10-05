"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { advisorStudents } from "@/lib/panel-data";

export default function AdvisorNotesPage() {
  const [studentId, setStudentId] = useState(advisorStudents[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  function save() {
    if (!note.trim()) return;
    const student = advisorStudents.find((s) => s.id === studentId);
    setSaved((prev) => [`${student?.name}: ${note.trim()}`, ...prev]);
    setNote("");
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Seans Notları</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Öğrenci bazlı notlar veli özetine ve bir sonraki seansa taşınır.
        </p>
      </div>

      <div className="grid gap-space-lg lg:grid-cols-2">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <label className="text-label-md font-semibold text-on-surface">
            Öğrenci seç
            <select
              className="input-field mt-1"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {advisorStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.grade}
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
              Henüz bu oturumda kayıtlı not yok. Soldan bir not ekleyebilirsin.
            </p>
          ) : (
            <ul className="mt-space-md space-y-space-sm">
              {saved.map((item, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-surface-container-low p-space-md text-body-sm text-on-surface"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
