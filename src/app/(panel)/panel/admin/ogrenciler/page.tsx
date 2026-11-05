"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { packages } from "@/lib/content";

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
  parentName?: string | null;
  packageId?: string | null;
  packageName?: string | null;
  meetingUsed?: number;
  meetingTotal?: number;
};

const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("12. Sınıf");
  const [program, setProgram] = useState("YKS Sayısal");
  const [packageId, setPackageId] = useState(packages[0]?.id || "yks-aylik");
  const [advisorId, setAdvisorId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");

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

  async function createStudent(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/admin/ogrenciler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        grade,
        program,
        packageId,
        advisorId: advisorId || null,
        parentName,
        parentEmail,
        parentPassword,
      }),
    });
    const data = (await response.json().catch(() => null)) as (Student & { parentReused?: boolean; error?: string }) | null;
    setSaving(false);
    if (!response.ok || !data || !data.id) {
      setError(data?.error || "Öğrenci eklenemedi.");
      return;
    }
    setStudents((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "tr")));
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setAdvisorId("");
    setPackageId(packages[0]?.id || "yks-aylik");
    setParentName("");
    setParentEmail("");
    setParentPassword("");
    setAdding(false);
    setNotice(
      data.parentReused
        ? `${data.name} eklendi. Veli hesabı zaten vardı, bu öğrenciye bağlandı.`
        : `${data.name} ve veli hesabı eklendi. Veli, ${parentEmail} ile giriş yapar.`,
    );
  }

  async function assign(student: Student, nextAdvisorId: string) {
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/admin/ogrenciler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student.id, advisorId: nextAdvisorId || null }),
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
          <h2 className="text-headline-sm text-on-surface">Öğrenciler</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Öğrenciyi ve velisini buradan ekle. Detaydan paket, toplantı hakkı ve iletişim bilgilerini gör.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-md">
          <button type="button" className="btn-primary" onClick={() => setAdding((open) => !open)}>
            {adding ? "Vazgeç" : "Öğrenci ekle"}
          </button>
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
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      {adding ? (
        <form
          onSubmit={createStudent}
          className="grid gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:grid-cols-2"
        >
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ad soyad" className={field} />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta" className={field} />
          <input required minLength={4} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Giriş şifresi" className={field} />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefon (isteğe bağlı)" className={field} />
          <select value={grade} onChange={(event) => setGrade(event.target.value)} className={field} aria-label="Sınıf">
            {["12. Sınıf", "Mezun", "11. Sınıf", "8. Sınıf", "7. Sınıf"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={program} onChange={(event) => setProgram(event.target.value)} className={field} aria-label="Program">
            {["YKS Sayısal", "YKS Eşit Ağırlık", "YKS Sözel / Dil", "LGS 8. Sınıf", "LGS 7. Sınıf"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            required
            value={packageId}
            onChange={(event) => setPackageId(event.target.value as typeof packageId)}
            className={field}
            aria-label="Paket"
          >
            {packages.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.program.toUpperCase()} · {pack.name} ({pack.duration})
              </option>
            ))}
          </select>
          <select value={advisorId} onChange={(event) => setAdvisorId(event.target.value)} className={field} aria-label="Danışman">
            <option value="">Danışman sonra atanacak</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name}
                {advisor.title ? ` · ${advisor.title}` : ""}
              </option>
            ))}
          </select>
          <input required value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Veli adı soyadı" className={field} />
          <input required type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="Veli e-posta" className={field} />
          <input required minLength={4} value={parentPassword} onChange={(event) => setParentPassword(event.target.value)} placeholder="Veli giriş şifresi" className={field} />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[900px] text-left text-body-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-space-md py-space-md font-semibold">Öğrenci</th>
              <th className="px-space-md py-space-md font-semibold">Sınıf / sınav</th>
              <th className="px-space-md py-space-md font-semibold">Paket</th>
              <th className="px-space-md py-space-md font-semibold">Danışman</th>
              <th className="px-space-md py-space-md font-semibold" />
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
                  {student.packageName ? (
                    <>
                      <p className="font-semibold text-on-surface">{student.packageName}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        Toplantı {student.meetingUsed ?? 0}/{student.meetingTotal ?? 0}
                      </p>
                    </>
                  ) : (
                    <span className="text-on-surface-variant">Paket yok</span>
                  )}
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
                <td className="px-space-md py-space-md">
                  <Link
                    href={`/panel/admin/ogrenciler/${student.id}`}
                    className="inline-flex rounded-lg bg-surface-container px-3 py-1.5 text-label-md font-semibold text-primary"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td className="px-space-md py-space-lg text-on-surface-variant" colSpan={5}>
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
