"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { NextMeetingCard, NextMeetingStat } from "./next-meeting";

type Task = {
  id: string;
  day: string;
  subject: string;
  title: string;
  duration: string;
  done: boolean;
};

type Summary = {
  hasPackage: boolean;
  packageName: string | null;
  completion: number;
  remainingTasks: number;
  lastNet: number | null;
  tasks: Task[];
};

function PackageGate() {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-space-md grid h-14 w-14 place-items-center rounded-full bg-primary-fixed text-primary">
          <Icon name="inventory_2" className="text-[28px]" />
        </div>
        <h2 className="text-headline-sm text-on-surface">Önce paket satın al</h2>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          Üyeliğin hazır. Haftalık program, deneme takibi ve görüşme hakları paket satın
          aldıktan sonra hesabına tanımlanır.
        </p>
        <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
          <Link href="/paketler" className="btn-primary">
            <Icon name="shopping_bag" className="text-[18px]" />
            Paketleri gör
          </Link>
          <Link href="/odeme" className="btn-secondary">
            Satın almaya git
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function StudentDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/ogrenci/ozet")
      .then(async (response) => {
        if (!response.ok) {
          setError("Özet yüklenemedi.");
          return;
        }
        setSummary((await response.json()) as Summary);
      })
      .catch(() => setError("Özet yüklenemedi."));
  }, []);

  if (error) {
    return <p className="text-body-sm text-error">{error}</p>;
  }

  if (!summary) {
    return <p className="text-body-sm text-on-surface-variant">Özet yükleniyor…</p>;
  }

  if (!summary.hasPackage) {
    return <PackageGate />;
  }

  return (
    <div className="space-y-space-lg">
      <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Haftalık Tamamlama", `%${summary.completion}`, "assignment_turned_in", "text-primary"],
          [
            "Son TYT Net",
            summary.lastNet != null ? String(summary.lastNet) : "—",
            "analytics",
            "text-secondary",
          ],
          ["Kalan Görev", String(summary.remainingTasks), "pending_actions", "text-primary"],
        ].map(([label, value, icon, color]) => (
          <div key={label} className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="mb-space-sm flex items-center justify-between">
              <p className="text-label-md text-on-surface-variant">{label}</p>
              <Icon name={icon} className={`text-[22px] ${color}`} />
            </div>
            <p className={`text-headline-md font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
        <NextMeetingStat />
      </div>

      <div className="grid gap-space-lg lg:grid-cols-5">
        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-3">
          <div className="mb-space-md flex items-center justify-between">
            <h2 className="text-title-lg font-bold text-on-surface">Bugünün / haftanın görevleri</h2>
            <Link href="/panel/ogrenci/program" className="text-label-md font-semibold text-primary">
              Tüm program
            </Link>
          </div>
          {summary.tasks.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Bu hafta henüz görev yazılmamış. Danışman atandıktan sonra program burada görünür.
            </p>
          ) : (
            <div className="space-y-space-sm">
              {summary.tasks.map((task) => (
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
          )}
        </section>

        <section className="lg:col-span-2">
          <NextMeetingCard />
        </section>
      </div>
    </div>
  );
}
