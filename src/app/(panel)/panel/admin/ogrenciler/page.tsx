"use client";

import { useEffect, useState } from "react";

type Advisor = { id: string; name: string; title: string | null };
type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  grade: string;
  program: string;
  advisorId: string | null;
  advisorName: string | null;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/ogrenciler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Öğrencileri görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { students: Student[]; advisors: Advisor[] };
        setStudents(data.students);
        setAdvisors(data.advisors);
      })
      .catch(() => setError("Öğrenci listesi yüklenemedi."));
  }, []);

  async function assign(student: Student, advisorId: string) {
    const nextId = advisorId || null;
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/admin/ogrenciler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student.id, advisorId: nextId }),
    });
    const data = (await response.json().catch(() => null)) as
      | { advisorId: string | null; advisorName: string | null; error?: string }
      | null;
    if (!response.ok || !data || !("advisorId" in data)) {
      setError(data && "error" in data ? data.error || "Atama kaydedilemedi." : "Atama kaydedilemedi.");
      return;
    }
    setStudents((prev) =>
      prev.map((item) =>
        item.id === student.id
          ? { ...item, advisorId: data.advisorId, advisorName: data.advisorName }
          : item,
      ),
    );
    setNotice(`${student.name} için danışman güncellendi.`);
  }

  const visible = onlyOpen ? students.filter((student) => !student.advisorId) : students;

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm text-on-surface">Öğrenci ataması</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Üye öğrencinin danışmanını seç. Boş bırakırsan atama kalkar.
          </p>
        </div>
        <label className="flex items-center gap-space-xs text-label-md text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={onlyOpen}
            onChange={(event) => setOnlyOpen(event.target.checked)}
          />
          Yalnızca atanmayanlar
        </label>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[760px] text-left text-body-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-space-md py-space-md font-semibold">Öğrenci</th>
              <th className="px-space-md py-space-md font-semibold">Sınıf / sınav</th>
              <th className="px-space-md py-space-md font-semibold">Danışman</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((student) => (
              <tr key={student.id} className="border-t border-outline-variant/40">
                <td className="px-space-md py-space-md">
                  <p className="font-semibold text-on-surface">{student.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{student.email}</p>
                </td>
                <td className="px-space-md py-space-md">
                  {student.grade} · {student.program}
                </td>
                <td className="px-space-md py-space-md">
                  <select
                    className="h-10 w-full max-w-xs rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    value={student.advisorId ?? ""}
                    onChange={(event) => assign(student, event.target.value)}
                  >
                    <option value="">Atanmadı</option>
                    {advisors.map((advisor) => (
                      <option key={advisor.id} value={advisor.id}>
                        {advisor.name}
                        {advisor.title ? ` · ${advisor.title}` : ""}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td className="px-space-md py-space-lg text-on-surface-variant" colSpan={3}>
                  Bu listede öğrenci yok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
