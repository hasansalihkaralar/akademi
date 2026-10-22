"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type StudentRow = {
  id: string;
  name: string;
  grade: string;
  program: string;
  completion: number;
  lastNet: number;
  risk: string;
  nextMeeting: string;
  requests: number;
};

export default function AdvisorStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/danisman/ogrenciler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Öğrencileri görmek için danışman hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { students: StudentRow[] };
        setStudents(data.students);
      })
      .catch(() => setError("Öğrenci listesi yüklenemedi."));
  }, []);

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Öğrencilerim</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Sana atanmış öğrencilerin tamamlama, son net ve risk durumu.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[720px] text-left text-body-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-space-md py-space-md font-semibold">Öğrenci</th>
              <th className="px-space-md py-space-md font-semibold">Program</th>
              <th className="px-space-md py-space-md font-semibold">Tamamlama</th>
              <th className="px-space-md py-space-md font-semibold">Son Net</th>
              <th className="px-space-md py-space-md font-semibold">Risk</th>
              <th className="px-space-md py-space-md font-semibold">Sonraki Seans</th>
              <th className="px-space-md py-space-md font-semibold" />
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-outline-variant/40">
                <td className="px-space-md py-space-md">
                  <p className="font-semibold text-on-surface">{student.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{student.grade}</p>
                </td>
                <td className="px-space-md py-space-md">{student.program}</td>
                <td className="px-space-md py-space-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-container-highest">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${student.completion}%` }} />
                    </div>
                    <span>%{student.completion}</span>
                  </div>
                </td>
                <td className="px-space-md py-space-md font-semibold">{student.lastNet}</td>
                <td className="px-space-md py-space-md">
                  <span
                    className={`rounded-full px-2.5 py-1 text-label-md font-bold capitalize ${
                      student.risk === "düşük"
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : student.risk === "orta"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-error/10 text-error"
                    }`}
                  >
                    {student.risk}
                  </span>
                </td>
                <td className="px-space-md py-space-md text-on-surface-variant">
                  {student.nextMeeting}
                  {student.requests > 0 ? (
                    <span className="mt-1 block font-semibold text-primary">Talep var</span>
                  ) : null}
                </td>
                <td className="px-space-md py-space-md">
                  <Link
                    href={`/panel/danisman/ogrenciler/${student.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 text-label-md font-semibold text-primary"
                  >
                    <Icon name="visibility" className="text-[16px]" />
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && !error ? (
              <tr>
                <td className="px-space-md py-space-lg text-on-surface-variant" colSpan={7}>
                  Sana atanmış öğrenci yok. Yönetim panelinden atama yapılınca burada görünür.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
