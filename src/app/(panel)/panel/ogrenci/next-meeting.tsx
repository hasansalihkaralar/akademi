"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Meeting = {
  id?: string;
  title: string;
  dateLabel: string;
  time: string;
  status: string;
  note: string | null;
  advisorNote?: string | null;
  meetUrl: string | null;
};

function isParentMeeting(meeting: Meeting) {
  return meeting.title === "Veli görüşme talebi" || meeting.title === "Veli görüşmesi";
}

function parentStatusLabel(status: string) {
  if (status === "done") return "Tamamlandı";
  if (status === "upcoming") return "Planlandı";
  return "Bekliyor";
}

type Next = { title: string; dateLabel: string; time: string; coach: string; meetUrl: string | null } | null;

function useNextMeeting() {
  const [next, setNext] = useState<Next>(null);
  const [parent, setParent] = useState(false);
  const [coach, setCoach] = useState("");
  const [requests, setRequests] = useState<Meeting[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorusmeler")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          coach: string;
          viewer?: string;
          meetings: Meeting[];
        };
        const upcoming = data.meetings.filter((meeting) => meeting.status === "upcoming");
        const isParent = data.viewer === "veli";
        const chosen = upcoming[0];
        setParent(isParent);
        setCoach(data.coach);
        setRequests(
          isParent
            ? data.meetings.filter(isParentMeeting)
            : data.meetings.filter((meeting) => meeting.status === "requested"),
        );
        setNext(
          chosen
            ? {
                title: chosen.title,
                dateLabel: chosen.dateLabel,
                time: chosen.time,
                coach: data.coach,
                meetUrl: isParent ? null : chosen.meetUrl,
              }
            : null,
        );
      })
      .finally(() => setReady(true));
  }, []);

  return { next, parent, coach, requests, setRequests, ready };
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
  const { next, parent, coach, requests, setRequests, ready } = useNextMeeting();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function sendRequest(event: React.FormEvent) {
    event.preventDefault();
    if (note.trim().length < 2) return;
    setSaving(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/ogrenci/gorusmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = (await response.json().catch(() => null)) as
      | { meetings?: Meeting[]; error?: string }
      | null;
    setSaving(false);
    if (!response.ok || !data?.meetings) {
      setError(data?.error || "Talep iletilemedi.");
      return;
    }
    setRequests(
      parent
        ? (data.meetings || []).filter(isParentMeeting)
        : (data.meetings || []).filter((meeting) => meeting.status === "requested"),
    );
    setNote("");
    setNotice("Talep danışmana iletildi.");
  }

  return (
    <div className="space-y-space-md">
      <div className="rounded-xl bg-primary p-space-lg text-on-primary shadow-md">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary-fixed">Sonraki görüşme</p>
        <h3 className="mt-space-sm text-headline-sm">{ready ? next?.title ?? "Planlı seans yok" : "…"}</h3>
        <p className="mt-1 text-body-sm text-primary-fixed">
          {next
            ? `${next.dateLabel} · ${next.time} · ${next.coach}`
            : parent
              ? "Planlanmış bir toplantı yok."
              : "Görüşmeler sayfasından randevu alabilirsin."}
        </p>
        {parent ? null : (
          <div className="mt-space-lg flex flex-wrap gap-space-sm">
            {next?.meetUrl ? (
              <a
                href={next.meetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-space-md py-2 text-label-md font-bold text-on-secondary"
              >
                <Icon name="videocam" className="text-[18px]" />
                Toplantıya katıl
              </a>
            ) : null}
            <Link
              href="/panel/ogrenci/gorusmeler"
              className="inline-flex items-center gap-1 rounded-full bg-primary-container px-space-md py-2 text-label-md font-bold text-on-primary"
            >
              Görüşmelere git
            </Link>
          </div>
        )}
      </div>

      {parent ? (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="text-title-lg font-bold text-on-surface">Görüşme talepleri</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Veli talepleri buradan iletilir. Danışman {coach || "…"} talebi görür ve randevu oluşturur.
          </p>
          {error ? <p className="mt-space-sm text-body-sm text-error">{error}</p> : null}
          {notice ? <p className="mt-space-sm text-body-sm text-primary">{notice}</p> : null}
          <form className="mt-space-md space-y-space-sm" onSubmit={sendRequest}>
            <textarea
              required
              minLength={2}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ne konuşmak istediğini kısaca yaz"
              className="w-full rounded-lg bg-surface-container-low px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "İletiliyor…" : "Talep gönder"}
            </button>
          </form>
          {requests.length > 0 ? (
            <ul className="mt-space-md space-y-space-sm">
              {requests.map((item, index) => (
                <li
                  key={item.id || `${item.note}-${index}`}
                  className="rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface"
                >
                  <span
                    className={`font-semibold ${
                      item.status === "done" ? "text-[#15803D]" : item.status === "upcoming" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {parentStatusLabel(item.status)}
                  </span>
                  <span className="mx-1">·</span>
                  {item.note || item.title}
                  {item.status === "upcoming" && item.dateLabel !== "Talep" ? (
                    <span className="mt-1 block text-on-surface-variant">
                      {item.dateLabel} · {item.time}
                    </span>
                  ) : null}
                  {item.advisorNote ? (
                    <span className="mt-1 block text-on-surface-variant">Danışman notu: {item.advisorNote}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
