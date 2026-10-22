"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Meeting = {
  id: string;
  title: string;
  dateLabel: string;
  time: string;
  type: string;
  status: string;
  note: string | null;
  meetUrl: string | null;
};

export function StudentMeetings() {
  const [coach, setCoach] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorusmeler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Görüşmeleri görmek için öğrenci hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { coach: string; meetings: Meeting[] };
        setCoach(data.coach);
        setMeetings(data.meetings);
      })
      .catch(() => setError("Görüşmeler yüklenemedi."));
  }, []);

  async function requestMeeting() {
    if (note.trim().length < 2) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/panel/ogrenci/gorusmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = (await response.json().catch(() => null)) as { coach?: string; meetings?: Meeting[]; error?: string } | null;
    setSaving(false);
    if (!response.ok || !data?.meetings) {
      setError(data?.error || "Talep iletilemedi.");
      return;
    }
    setCoach(data.coach || coach);
    setMeetings(data.meetings);
    setNote("");
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Görüşmeler</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Danışmanına görüşme talebi ilet, planlanan seansları burada gör.
        </p>
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <form
        className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void requestMeeting();
        }}
      >
        <label className="block text-label-md font-semibold text-on-surface">
          Görüşme talebi
          <textarea
            className="input-field mt-1 h-24 py-3"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Örn. Salı akşamı deneme analizi konuşalım"
          />
        </label>
        <button type="submit" className="btn-primary mt-space-md" disabled={saving}>
          <Icon name="calendar_add_on" className="text-[18px]" />
          {saving ? "İletiliyor…" : "Görüşme talep et"}
        </button>
      </form>

      <div className="grid gap-space-md">
        {meetings.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Henüz görüşme yok.</p>
        ) : null}
        {meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-space-md">
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${
                  meeting.status === "upcoming"
                    ? "bg-secondary-fixed text-secondary"
                    : "bg-surface-container text-primary"
                }`}
              >
                <Icon name={meeting.type === "online" ? "videocam" : "chat"} className="text-[24px]" />
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">{meeting.title}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {coach}
                  {meeting.status === "requested"
                    ? " · Tarih danışman tarafından belirlenecek"
                    : ` · ${meeting.dateLabel} · ${meeting.time}`}
                </p>
                {meeting.note ? <p className="mt-1 text-body-sm text-on-surface">{meeting.note}</p> : null}
              </div>
            </div>
            <div className="flex flex-col items-start gap-space-sm sm:items-end">
              {meeting.meetUrl && meeting.status === "upcoming" ? (
                <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="btn-primary">
                  <Icon name="videocam" className="text-[18px]" />
                  Katıl
                </a>
              ) : null}
              <span className="rounded-full bg-surface-container px-space-md py-2 text-label-md font-semibold text-on-surface-variant">
                {meeting.status === "requested" ? "Talep iletildi" : meeting.status === "upcoming" ? "Yaklaşan" : "Tamamlandı"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
