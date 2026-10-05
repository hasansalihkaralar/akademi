import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { advisorStudents } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Öğrencilerim" };

export default function AdvisorStudentsPage() {
  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm text-on-surface">Öğrencilerim</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Tamamlama, son net ve risk skoruna göre takip listesi.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Icon name="person_add" className="text-[18px]" />
          Yeni eşleştirme
        </button>
      </div>

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
            {advisorStudents.map((student) => (
              <tr key={student.id} className="border-t border-outline-variant/40">
                <td className="px-space-md py-space-md">
                  <p className="font-semibold text-on-surface">{student.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{student.grade}</p>
                </td>
                <td className="px-space-md py-space-md">{student.program}</td>
                <td className="px-space-md py-space-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${student.completion}%` }}
                      />
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
                </td>
                <td className="px-space-md py-space-md">
                  <button
                    type="button"
                    className="rounded-lg bg-surface-container px-3 py-1.5 text-label-md font-semibold text-primary"
                  >
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
