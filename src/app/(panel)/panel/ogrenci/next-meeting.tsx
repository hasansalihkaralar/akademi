"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Next = { title: string; dateLabel: string; time: string; coach: string; meetUrl: string | null } | null;

function useNextMeeting() {
  const [next, setNext] = useState<Next>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorusmeler")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          coach: string;
          meetings: { title: string; dateLabel: string; time: string; status: string; meetUrl: string | null }[];
        };
        const upcoming = data.meetings.find((meeting) => meeting.status === "upcoming");
        setNext(
          upcoming
            ? {
                title: upcoming.title,
                dateLabel: upcoming.dateLabel,
                time: upcoming.time,
                coach: data.coach,
                meetUrl: upcoming.meetUrl,
              }
            : null,
        );
      })
      .finally(() => setReady(true));
  }, []);

  return { next, ready };
}

export function NextMeetingStat() {
  const { next, ready } = useNextMeeting();
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-sm flex items-center justify-between">
        <p className="text-label-md text-on-surface-variant">Sonraki Seans</p>
        <Icon name="videocam" className="text-[22px] text-secondary" />
      </div>
      <p className="text-headline-md font-extrabold text-secondary">
        {ready ? next?.dateLabel ?? "—" : "…"}
      </p>
    </div>
  );
}

export function NextMeetingCard() {
  const { next, ready } = useNextMeeting();
  return (
    <div className="rounded-xl bg-primary p-space-lg text-on-primary shadow-md">
      <p className="text-label-md font-bold uppercase tracking-wider text-primary-fixed">Sonraki görüşme</p>
      <h3 className="mt-space-sm text-headline-sm">{ready ? next?.title ?? "Planlı seans yok" : "…"}</h3>
      <p className="mt-1 text-body-sm text-primary-fixed">
        {next ? `${next.dateLabel} · ${next.time} · ${next.coach}` : "Görüşmeler sayfasından talep edebilirsin."}
      </p>
      <div className="mt-space-lg flex flex-wrap gap-space-sm">
        {next?.meetUrl ? (
          <a
            href={next.meetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-space-md py-2 text-label-md font-bold text-on-secondary"
          >
            <Icon name="videocam" className="text-[18px]" />
            Katıl
          </a>
        ) : null}
        <Link
          href="/panel/ogrenci/gorusmeler"
          className="inline-flex items-center gap-1 rounded-full bg-primary-container px-space-md py-2 text-label-md font-bold text-on-primary"
        >
          Görüşmelere git
        </Link>
      </div>
    </div>
  );
}
