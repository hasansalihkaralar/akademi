"use client";

import { Icon } from "@/components/Icon";
import { PROGRAM_DAYS, shiftWeekIso, weekRangeLabel, weekStartIso } from "@/lib/meeting-date";

export function groupWeekTasks<T extends { weekStart: string; day: string; sortOrder: number }>(tasks: T[], week: string) {
  const current = weekStartIso();
  return PROGRAM_DAYS.map((day) => ({
    day,
    items: tasks
      .filter((task) => (task.weekStart || current) === week && task.day === day)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })).filter((group) => group.items.length > 0);
}

export function WeekNav({ week, onChange }: { week: string; onChange: (week: string) => void }) {
  const current = weekStartIso();

  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm">
      <p className="text-title-md font-bold text-on-surface">{weekRangeLabel(week)}</p>
      <div className="flex items-center gap-space-sm">
        {week === current ? null : (
          <button type="button" className="btn-secondary" onClick={() => onChange(current)}>
            Bu hafta
          </button>
        )}
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full bg-surface-container text-primary"
          aria-label="Önceki hafta"
          onClick={() => onChange(shiftWeekIso(week, -1))}
        >
          <Icon name="chevron_left" className="text-[22px]" />
        </button>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full bg-surface-container text-primary"
          aria-label="Sonraki hafta"
          onClick={() => onChange(shiftWeekIso(week, 1))}
        >
          <Icon name="chevron_right" className="text-[22px]" />
        </button>
      </div>
    </div>
  );
}
