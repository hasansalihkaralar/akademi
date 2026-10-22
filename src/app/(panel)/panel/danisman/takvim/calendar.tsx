"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { parseMeetingDate, sameCalendarDay, startOfWeek } from "@/lib/meeting-date";

type Meeting = {
  id: string;
  student: string;
  title: string;
  dateLabel: string;
  time: string;
  type: string;
  status: string;
  note: string | null;
  meetUrl: string | null;
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function shiftDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayLabel(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function AdvisorCalendar() {
  const [selected, setSelected] = useState(() => new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/danisman/gorusmeler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Takvimi görmek için danışman hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { meetings: Meeting[] };
        setMeetings(data.meetings);
      })
      .catch(() => setError("Takvim yüklenemedi."));
  }, []);

  const weekStart = startOfWeek(selected);
  const days = WEEKDAYS.map((label, index) => {
    const date = shiftDays(weekStart, index);
    return { label, date };
  });
  const weekEnd = days[6].date;
  const range =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()}–${weekEnd.getDate()} ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${dayLabel(weekStart)} – ${dayLabel(weekEnd)} ${weekEnd.getFullYear()}`;

  const dated = useMemo(
    () =>
      meetings.flatMap((meeting) => {
        const date = parseMeetingDate(meeting.dateLabel);
        return date ? [{ ...meeting, date }] : [];
      }),
    [meetings],
  );
  const selectedMeetings = dated
    .filter((meeting) => sameCalendarDay(meeting.date, selected))
    .sort((a, b) => a.time.localeCompare(b.time));
  const today = new Date();
  const viewingToday = sameCalendarDay(selected, today);

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm text-on-surface">Seans Takvimi</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">{range}</p>
        </div>
        <div className="flex items-center gap-space-sm">
          {viewingToday ? null : (
            <button type="button" className="btn-secondary" onClick={() => setSelected(new Date())}>
              Bugün
            </button>
          )}
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-surface-container text-primary" aria-label="Önceki hafta" onClick={() => setSelected((date) => shiftDays(date, -7))}>
            <Icon name="chevron_left" className="text-[22px]" />
          </button>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-surface-container text-primary" aria-label="Sonraki hafta" onClick={() => setSelected((date) => shiftDays(date, 7))}>
            <Icon name="chevron_right" className="text-[22px]" />
          </button>
        </div>
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <div className="grid grid-cols-7 gap-space-sm">
        {days.map((day) => {
          const active = sameCalendarDay(day.date, selected);
          const isToday = sameCalendarDay(day.date, today);
          const count = dated.filter((meeting) => sameCalendarDay(meeting.date, day.date)).length;
          return (
            <button
              key={day.label}
              type="button"
              onClick={() => setSelected(day.date)}
              className={`rounded-xl p-space-sm text-center shadow-sm ${
                active
                  ? "bg-primary text-on-primary"
                  : isToday
                    ? "bg-surface-container-lowest text-on-surface ring-2 ring-primary"
                    : "bg-surface-container-lowest text-on-surface"
              }`}
            >
              <p className="text-label-md font-bold">{day.label}</p>
              <p className="text-title-lg font-extrabold">{day.date.getDate()}</p>
              <p className={`text-label-md ${active ? "text-on-primary" : "text-on-surface-variant"}`}>
                {count > 0 ? count : "·"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h3 className="mb-space-md text-title-lg font-bold text-on-surface">
          {viewingToday ? `Bugün — ${dayLabel(selected)}` : dayLabel(selected)}
        </h3>
        {selectedMeetings.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Bu günde görüşme yok.</p>
        ) : (
          <div className="space-y-space-sm">
            {selectedMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center gap-space-md rounded-lg bg-surface-container-low p-space-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-on-primary">
                  <Icon name={meeting.type === "online" ? "videocam" : "chat"} className="text-[22px]" />
                </div>
                <div>
                  <p className="text-title-md font-bold text-on-surface">
                    {meeting.time} · {meeting.student}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {meeting.title}
                    {meeting.note ? ` · ${meeting.note}` : ""}
                  </p>
                  {meeting.meetUrl ? (
                    <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="text-label-md font-semibold text-primary">
                      Meet bağlantısı
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
