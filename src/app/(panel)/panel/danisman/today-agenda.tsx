"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { parseMeetingDate, sameCalendarDay } from "@/lib/meeting-date";

type Meeting = {
  id: string;
  student: string;
  title: string;
  dateLabel: string;
  time: string;
  type: string;
  note: string | null;
};

function useTodayMeetings() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);

  useEffect(() => {
    fetch("/api/panel/danisman/gorusmeler")
      .then(async (response) => {
        if (!response.ok) {
          setMeetings([]);
          return;
        }
        const data = (await response.json()) as { meetings: Meeting[] };
        const today = new Date();
        setMeetings(
          data.meetings
            .filter((meeting) => {
              const date = parseMeetingDate(meeting.dateLabel);
              return date ? sameCalendarDay(date, today) : false;
            })
            .sort((a, b) => a.time.localeCompare(b.time)),
        );
      })
      .catch(() => setMeetings([]));
  }, []);

  return meetings;
}

export function TodaySessionCount() {
  const meetings = useTodayMeetings();
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-sm flex items-center justify-between">
        <p className="text-label-md text-on-surface-variant">Bugün Seans</p>
        <span className="material-symbols-outlined text-[22px] text-primary">event</span>
      </div>
      <p className="text-headline-md font-extrabold text-primary">{meetings ? meetings.length : "…"}</p>
    </div>
  );
}

export function TodayAgenda() {
  const meetings = useTodayMeetings();
  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2">
      <h2 className="mb-space-md text-title-lg font-bold text-on-surface">Bugünün ajandası</h2>
      {meetings === null ? <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p> : null}
      {meetings && meetings.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">Bugün görüşme yok.</p>
      ) : null}
      <div className="space-y-space-sm">
        {meetings?.map((item) => (
          <div key={item.id} className="rounded-lg border-l-4 border-secondary-container bg-surface-container-low p-space-sm">
            <p className="text-label-md font-bold text-secondary">{item.time}</p>
            <p className="text-title-md font-semibold text-on-surface">{item.student}</p>
            <p className="text-body-sm text-on-surface-variant">
              {item.title}
              {item.note ? ` · ${item.note}` : ""}
            </p>
          </div>
        ))}
      </div>
      <Link href="/panel/danisman/takvim" className="btn-secondary mt-space-md w-full">
        Takvimi aç
      </Link>
    </section>
  );
}
