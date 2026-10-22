"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { groupWeekTasks, WeekNav } from "@/components/panel/WeekNav";
import { PROGRAM_DAYS, weekStartIso } from "@/lib/meeting-date";

type Task = {
  id: string;
  weekStart: string;
  day: string;
  subject: string;
  title: string;
  duration: string;
  videoUrl: string | null;
  done: boolean;
  sortOrder: number;
};

type DayNote = { weekStart: string; day: string; body: string };

export default function StudentProgramPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayNotes, setDayNotes] = useState<DayNote[]>([]);
  const [canToggle, setCanToggle] = useState(true);
  const [error, setError] = useState("");
  const [week, setWeek] = useState(() => weekStartIso());

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorevler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Programı görmek için öğrenci hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { tasks: Task[]; dayNotes?: DayNote[]; viewer?: string };
        setTasks(data.tasks);
        setDayNotes(data.dayNotes ?? []);
        setCanToggle(data.viewer !== "veli");
      })
      .catch(() => setError("Program yüklenemedi."));
  }, []);

  async function toggle(task: Task) {
    const next = !task.done;
    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, done: next } : item)));
    const response = await fetch("/api/panel/ogrenci/gorevler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done: next }),
    });
    if (!response.ok) {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, done: task.done } : item)));
    }
  }

  const taskGroups = groupWeekTasks(tasks, week);
  const groups = PROGRAM_DAYS.map((day) => ({
    day,
    items: taskGroups.find((group) => group.day === day)?.items ?? [],
    note: dayNotes.find((note) => note.weekStart === week && note.day === day)?.body ?? "",
  })).filter((group) => group.items.length > 0 || group.note);
  const visible = groups.flatMap((group) => group.items);
  const done = visible.filter((task) => task.done).length;
  const pct = visible.length ? Math.round((done / visible.length) * 100) : 0;

  return (
    <div className="space-y-space-lg">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-space-md">
          <div>
            <h2 className="text-headline-sm text-on-surface">Haftalık Program</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">Koçunun seçili hafta için yazdığı görevler</p>
          </div>
          <div className="text-right">
            <p className="text-stat-counter text-primary">%{pct}</p>
            <p className="text-label-md text-on-surface-variant">
              {done}/{visible.length} görev
            </p>
          </div>
        </div>
        <div className="mt-space-md h-2.5 overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full rounded-full bg-secondary-container" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-space-md">
          <WeekNav week={week} onChange={setWeek} />
        </div>
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      {groups.length === 0 && !error ? (
        <p className="text-body-sm text-on-surface-variant">Seçili haftaya program yazılmamış.</p>
      ) : null}

      <div className="space-y-space-md">
        {groups.map((group) => (
          <section key={group.day} className="space-y-space-sm">
            <h3 className="text-label-md font-bold text-primary">{group.day}</h3>
            {group.note ? (
              <div className="rounded-xl bg-secondary-fixed px-space-md py-space-sm text-on-secondary-fixed">
                <p className="text-label-md font-bold">Koç notu</p>
                <p className="mt-1 text-body-sm">{group.note}</p>
              </div>
            ) : null}
            {group.items.map((task) => {
              const showTick = canToggle && task.done;
              const body = (
                <>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-label-md font-bold ${
                      showTick ? "bg-primary text-on-primary" : "bg-surface-container text-primary"
                    }`}
                  >
                    {showTick ? <Icon name="check" className="text-[20px]" /> : task.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-title-md font-semibold ${task.done ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                      {task.title}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {task.subject} · {task.duration}
                    </p>
                  </div>
                </>
              );
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm"
                >
                  {canToggle ? (
                    <button type="button" onClick={() => toggle(task)} className="flex min-w-0 flex-1 items-center gap-space-md text-left">
                      {body}
                    </button>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-center gap-space-md">{body}</div>
                  )}
                  {task.videoUrl ? (
                    <a
                      href={task.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-fixed px-3 py-2 text-label-md font-semibold text-primary"
                    >
                      <Icon name="play_circle" className="text-[18px]" />
                      Videoyu aç
                    </a>
                  ) : null}
                  {canToggle ? (
                    <button
                      type="button"
                      onClick={() => toggle(task)}
                      aria-label={task.done ? "Tamamlandı" : "Tamamla"}
                      className="grid h-10 w-10 shrink-0 place-items-center"
                    >
                      <Icon
                        name={task.done ? "check_circle" : "radio_button_unchecked"}
                        className={`text-[24px] ${task.done ? "text-secondary" : "text-outline"}`}
                      />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
