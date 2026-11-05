"use client";

import { useState } from "react";
import { meetingLabelToIso } from "@/lib/meeting-date";

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

export function MeetingActions({
  studentId,
  meeting,
  onChange,
  onRemove,
}: {
  studentId: string;
  meeting: Meeting;
  onChange: (meeting: Meeting) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(() => meetingLabelToIso(meeting.dateLabel));
  const [time, setTime] = useState(meeting.time.slice(0, 5));
  const [type, setType] = useState(meeting.type === "check-in" ? "check-in" : "online");
  const [note, setNote] = useState(meeting.note ?? "");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (meeting.status !== "upcoming") return null;

  function startEdit() {
    setTitle(meeting.title);
    setDate(meetingLabelToIso(meeting.dateLabel));
    setTime(meeting.time.slice(0, 5));
    setType(meeting.type === "check-in" ? "check-in" : "online");
    setNote(meeting.note ?? "");
    setError("");
    setConfirming(false);
    setOpen(true);
  }

  function closeEdit() {
    setOpen(false);
    setError("");
  }

  async function save() {
    if (!title.trim() || !date || !time) return;
    setBusy("save");
    setError("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${studentId}/gorusmeler`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: meeting.id, title, date, time: time.slice(0, 5), type, note }),
    });
    const data = (await response.json().catch(() => null)) as Meeting | { error?: string } | null;
    setBusy("");
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data && data.error ? data.error : "Randevu güncellenemedi.");
      return;
    }
    onChange(data);
    setOpen(false);
  }

  function askCancel() {
    setOpen(false);
    setError("");
    setConfirming(true);
  }

  async function cancelMeeting() {
    setBusy("cancel");
    setError("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${studentId}/gorusmeler`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: meeting.id }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusy("");
    if (!response.ok) {
      setError(data?.error || "Randevu iptal edilemedi.");
      return;
    }
    onRemove(meeting.id);
  }

  return (
    <div className="mt-space-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full bg-surface-container-lowest px-3 py-2 text-label-md font-semibold text-primary"
          disabled={busy !== ""}
          onClick={() => (open ? closeEdit() : startEdit())}
        >
          {open ? "Vazgeç" : "Düzenle"}
        </button>
        <button
          type="button"
          className="rounded-full bg-surface-container-lowest px-3 py-2 text-label-md font-semibold text-error"
          disabled={busy !== ""}
          onClick={askCancel}
        >
          İptal et
        </button>
      </div>
      {confirming ? (
        <div className="mt-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm ring-1 ring-error">
          <p className="text-body-sm font-semibold text-error">
            {meeting.dateLabel} {meeting.time} randevusu iptal edilsin mi? Bu işlem geri alınmaz.
          </p>
          <div className="mt-space-sm flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-surface-container-lowest px-3 py-2 text-label-md font-semibold text-primary"
              disabled={busy !== ""}
              onClick={() => setConfirming(false)}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="rounded-full bg-error px-3 py-2 text-label-md font-semibold text-white"
              disabled={busy !== ""}
              onClick={() => void cancelMeeting()}
            >
              {busy === "cancel" ? "İptal ediliyor…" : "Evet, iptal et"}
            </button>
          </div>
        </div>
      ) : null}
      {open ? (
        <form
          className="mt-space-sm space-y-space-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <input className="input-field" value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Başlık" required />
          <div className="grid grid-cols-2 gap-space-sm">
            <input className="input-field" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Tarih" required />
            <input className="input-field" type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Saat" required />
          </div>
          <select className="input-field" value={type} onChange={(event) => setType(event.target.value)} aria-label="Tür">
            <option value="online">Online görüşme</option>
            <option value="check-in">Kısa check-in</option>
          </select>
          <input className="input-field" value={note} onChange={(event) => setNote(event.target.value)} aria-label="Not" placeholder="Not" />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary" disabled={busy !== ""}>
              {busy === "save" ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button type="button" className="btn-secondary" disabled={busy !== ""} onClick={closeEdit}>
              Vazgeç
            </button>
          </div>
        </form>
      ) : null}
      {error ? <p className="mt-space-sm text-body-sm text-error">{error}</p> : null}
    </div>
  );
}
