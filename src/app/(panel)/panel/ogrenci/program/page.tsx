"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { studentTasks } from "@/lib/panel-data";

export default function StudentProgramPage() {
  const [tasks, setTasks] = useState(studentTasks);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <div className="space-y-space-lg">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-space-md">
          <div>
            <h2 className="text-headline-sm text-on-surface">Haftalık Program</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              30 Eyl – 6 Eki · Koç tarafından PDR onaylı
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

      <div className="space-y-space-sm">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggle(task.id)}
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
