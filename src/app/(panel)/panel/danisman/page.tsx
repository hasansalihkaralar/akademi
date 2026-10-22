import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { advisorStudents } from "@/lib/panel-data";
import { TodayAgenda, TodaySessionCount } from "./today-agenda";

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
        <TodaySessionCount />
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

        <TodayAgenda />
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
