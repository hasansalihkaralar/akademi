"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Task = {
  id: string;
  day: string;
  subject: string;
  title: string;
  duration: string;
  done: boolean;
};

export default function StudentProgramPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorevler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Programı görmek için öğrenci hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { tasks: Task[] };
        setTasks(data.tasks);
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

  const done = tasks.filter((task) => task.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-space-lg">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-space-md">
          <div>
            <h2 className="text-headline-sm text-on-surface">Haftalık Program</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Koç tarafından PDR onaylı görev listesi
            </p>
          </div>
          <div className="text-right">
            <p className="text-stat-counter text-primary">%{pct}</p>
            <p className="text-label-md text-on-surface-variant">
              {done}/{tasks.length} görev
            </p>
          </div>
        </div>
        <div className="mt-space-md h-2.5 overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full rounded-full bg-secondary-container" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <div className="space-y-space-sm">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggle(task)}
            className="flex w-full items-center gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md text-left shadow-sm transition hover:shadow-md"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-lg text-label-md font-bold ${
                task.done ? "bg-primary text-on-primary" : "bg-surface-container text-primary"
              }`}
            >
              {task.done ? <Icon name="check" className="text-[20px]" /> : task.day}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-title-md font-semibold ${
                  task.done ? "text-on-surface-variant line-through" : "text-on-surface"
                }`}
              >
                {task.title}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {task.subject} · {task.duration}
              </p>
            </div>
            <Icon
              name={task.done ? "check_circle" : "radio_button_unchecked"}
              className={`text-[24px] ${task.done ? "text-secondary" : "text-outline"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
