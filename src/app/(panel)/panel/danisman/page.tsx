import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { advisorAgenda, advisorStudents } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Danışman Özet" };

export default function AdvisorDashboardPage() {
  const atRisk = advisorStudents.filter((s) => s.risk !== "düşük").length;
  const avgCompletion = Math.round(
    advisorStudents.reduce((sum, s) => sum + s.completion, 0) / advisorStudents.length,
  );

  return (
    <div className="space-y-space-lg">
      <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Aktif Öğrenci", String(advisorStudents.length), "groups"],
          ["Ort. Tamamlama", `%${avgCompletion}`, "monitoring"],
          ["Riskli Öğrenci", String(atRisk), "warning"],
          ["Bugün Seans", String(advisorAgenda.length), "event"],
        ].map(([label, value, icon]) => (
          <div
            key={label}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="mb-space-sm flex items-center justify-between">
              <p className="text-label-md text-on-surface-variant">{label}</p>
              <Icon name={icon} className="text-[22px] text-primary" />
            </div>
            <p className="text-headline-md font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-space-lg lg:grid-cols-5">
        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-3">
          <div className="mb-space-md flex items-center justify-between">
            <h2 className="text-title-lg font-bold text-on-surface">Öğrenci durumu</h2>
            <Link
              href="/panel/danisman/ogrenciler"
              className="text-label-md font-semibold text-primary"
            >
              Tümünü gör
            </Link>
          </div>
          <div className="space-y-space-sm">
            {advisorStudents.slice(0, 4).map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-space-md rounded-lg bg-surface-container-low px-space-md py-space-sm"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-label-md font-bold text-on-primary">
                  {student.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-on-surface">{student.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {student.grade} · {student.program} · %{student.completion}
                  </p>
                </div>
                <RiskBadge risk={student.risk} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2">
          <h2 className="mb-space-md text-title-lg font-bold text-on-surface">Bugünün ajandası</h2>
          <div className="space-y-space-sm">
            {advisorAgenda.map((item) => (
              <div
                key={item.time + item.student}
                className="rounded-lg border-l-4 border-secondary-container bg-surface-container-low p-space-sm"
              >
                <p className="text-label-md font-bold text-secondary">{item.time}</p>
                <p className="text-title-md font-semibold text-on-surface">{item.student}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {item.type} · {item.note}
                </p>
              </div>
            ))}
          </div>
          <Link href="/panel/danisman/takvim" className="btn-secondary mt-space-md w-full">
            Takvimi aç
          </Link>
        </section>
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: "düşük" | "orta" | "yüksek" }) {
  const styles = {
    düşük: "bg-[#DCFCE7] text-[#15803D]",
    orta: "bg-tertiary-fixed text-on-tertiary-fixed",
    yüksek: "bg-error/10 text-error",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-label-md font-bold capitalize ${styles[risk]}`}>
      {risk}
    </span>
  );
}
