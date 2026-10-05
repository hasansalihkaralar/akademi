import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { studentMeetings, studentTasks, studentTrials } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Öğrenci Özet" };

export default function StudentDashboardPage() {
  const done = studentTasks.filter((t) => t.done).length;
  const completion = Math.round((done / studentTasks.length) * 100);
  const nextMeeting = studentMeetings.find((m) => m.status === "upcoming");
  const lastTrial = studentTrials[0];

  return (
    <div className="space-y-space-lg">
      <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Haftalık Tamamlama", `%${completion}`, "assignment_turned_in", "text-primary"],
          ["Son TYT Net", String(lastTrial.tyt || lastTrial.ayt), "analytics", "text-secondary"],
          ["Kalan Görev", String(studentTasks.length - done), "pending_actions", "text-primary"],
          ["Sonraki Seans", nextMeeting?.date ?? "—", "videocam", "text-secondary"],
        ].map(([label, value, icon, color]) => (
          <div
            key={label}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="mb-space-sm flex items-center justify-between">
              <p className="text-label-md text-on-surface-variant">{label}</p>
              <Icon name={icon} className={`text-[22px] ${color}`} />
            </div>
            <p className={`text-headline-md font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-space-lg lg:grid-cols-5">
        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-3">
          <div className="mb-space-md flex items-center justify-between">
            <h2 className="text-title-lg font-bold text-on-surface">Bugünün / haftanın görevleri</h2>
            <Link href="/panel/ogrenci/program" className="text-label-md font-semibold text-primary">
              Tüm program
            </Link>
          </div>
          <div className="space-y-space-sm">
            {studentTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-space-md rounded-lg bg-surface-container-low px-space-md py-space-sm"
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-label-md font-bold ${
                    task.done
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-primary"
                  }`}
                >
                  {task.done ? "✓" : task.day}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-title-md font-semibold text-on-surface">{task.title}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {task.subject} · {task.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-space-lg lg:col-span-2">
          <div className="rounded-xl bg-primary p-space-lg text-on-primary shadow-md">
            <p className="text-label-md font-bold uppercase tracking-wider text-primary-fixed">
              Sonraki görüşme
            </p>
            <h3 className="mt-space-sm text-headline-sm">{nextMeeting?.title}</h3>
            <p className="mt-1 text-body-sm text-primary-fixed">
              {nextMeeting?.date} · {nextMeeting?.time} · {nextMeeting?.with}
            </p>
            <Link
              href="/panel/ogrenci/gorusmeler"
              className="mt-space-lg inline-flex items-center gap-1 rounded-full bg-secondary-container px-space-md py-2 text-label-md font-bold text-on-secondary"
            >
              <Icon name="videocam" className="text-[18px]" />
              Seansa git
            </Link>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface">Koç notu</h3>
            <p className="mt-space-sm text-body-sm leading-relaxed text-on-surface-variant">
              Bu hafta türev setini bitirmen kritik. Perşembe denemesinden önce AYT Mat yanlış
              köklerini paneldeki karakutuya yükle.
            </p>
            <p className="mt-space-sm text-label-md font-semibold text-primary">— Mert Yılmaz</p>
          </div>
        </section>
      </div>
    </div>
  );
}
