"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Detail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  grade: string;
  program: string;
  risk: string;
  lastNet: number;
  completion: number;
  parent: { name: string; phone: string | null; email: string } | null;
  tasks: { id: string; day: string; subject: string; title: string; duration: string; done: boolean }[];
  trials: { id: string; name: string; dateLabel: string; tyt: number; ayt: number; delta: string }[];
  meetings: { id: string; title: string; dateLabel: string; time: string; type: string; status: string; note: string | null; meetUrl: string | null }[];
  notes: { id: string; body: string; author: string; createdAt: string }[];
};

export default function AdvisorStudentDetailPage() {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [day, setDay] = useState<(typeof days)[number]>("Pzt");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("60 dk");
  const [saving, setSaving] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("Haftalık birebir seans");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("19:00");
  const [meetingType, setMeetingType] = useState<"online" | "check-in">("online");
  const [meetingNote, setMeetingNote] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  async function addTask() {
    if (!student || !title.trim() || !subject.trim()) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${student.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, subject, title, duration }),
    });
    const data = (await response.json().catch(() => null)) as Detail["tasks"][number] | { error?: string } | null;
    setSaving(false);
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data && data.error ? data.error : "Görev kaydedilemedi.");
      return;
    }
    setStudent((prev) => {
      if (!prev) return prev;
      const tasks = [...prev.tasks, data];
      const done = tasks.filter((task) => task.done).length;
      return { ...prev, tasks, completion: Math.round((done / tasks.length) * 100) };
    });
    setTitle("");
    setSubject("");
  }

  function putMeeting(meeting: Detail["meetings"][number]) {
    setStudent((prev) => {
      if (!prev) return prev;
      const exists = prev.meetings.some((item) => item.id === meeting.id);
      const meetings = exists
        ? prev.meetings.map((item) => (item.id === meeting.id ? meeting : item))
        : [...prev.meetings, meeting];
      return { ...prev, meetings };
    });
  }

  async function addMeeting() {
    if (!student || !meetingTitle.trim() || !meetingDate || !meetingTime) return;
    setSavingMeeting(true);
    setError("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${student.id}/gorusmeler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: meetingTitle,
        date: meetingDate,
        time: meetingTime,
        type: meetingType,
        note: meetingNote,
      }),
    });
    const data = (await response.json().catch(() => null)) as Detail["meetings"][number] | { error?: string } | null;
    setSavingMeeting(false);
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data && data.error ? data.error : "Randevu kaydedilemedi.");
      return;
    }
    putMeeting(data);
    setMeetingNote("");
  }

  async function confirmMeeting(meetingId: string, date: string, time: string) {
    if (!student || !date || !time) return;
    setError("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${student.id}/gorusmeler`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: meetingId, date, time }),
    });
    const data = (await response.json().catch(() => null)) as Detail["meetings"][number] | { error?: string } | null;
    if (!response.ok || !data || !("id" in data)) {
      setError(data && "error" in data && data.error ? data.error : "Talep randevuya çevrilemedi.");
      return;
    }
    putMeeting(data);
  }

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/panel/danisman/ogrenciler/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          setError("Öğrenci detayı açılamadı.");
          return;
        }
        setStudent((await response.json()) as Detail);
      })
      .catch(() => setError("Öğrenci detayı yüklenemedi."));
  }, [params.id]);

  return (
    <div className="space-y-space-lg">
      <Link href="/panel/danisman/ogrenciler" className="inline-flex items-center gap-1 text-label-md font-semibold text-primary">
        <Icon name="arrow_back" className="text-[18px]" />
        Öğrencilerime dön
      </Link>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {!student && !error ? <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p> : null}

      {student ? (
        <>
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-space-md">
              <div>
                <h2 className="text-headline-sm text-on-surface">{student.name}</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {student.grade} · {student.program} · {student.email}
                  {student.phone ? ` · ${student.phone}` : ""}
                </p>
                {student.parent ? (
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    Veli: {student.parent.name}
                    {student.parent.phone ? ` · ${student.parent.phone}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-stat-counter text-primary">%{student.completion}</p>
                <p className="text-label-md text-on-surface-variant">görev tamamlama · son net {student.lastNet}</p>
              </div>
            </div>
          </div>

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Görevler</h3>
            <form
              className="mb-space-md grid gap-space-sm sm:grid-cols-2 lg:grid-cols-[7rem_1fr_1.4fr_7rem_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                void addTask();
              }}
            >
              <label className="text-label-md font-semibold text-on-surface">
                Gün
                <select className="input-field mt-1" value={day} onChange={(event) => setDay(event.target.value as (typeof days)[number])}>
                  {days.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-label-md font-semibold text-on-surface">
                Ders
                <input className="input-field mt-1" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Matematik" />
              </label>
              <label className="text-label-md font-semibold text-on-surface">
                Görev
                <input className="input-field mt-1" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Problem seti, 40 soru" />
              </label>
              <label className="text-label-md font-semibold text-on-surface">
                Süre
                <input className="input-field mt-1" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="60 dk" />
              </label>
              <button type="submit" className="btn-primary self-end" disabled={saving}>
                <Icon name="add" className="text-[18px]" />
                {saving ? "Kaydediliyor…" : "Görevi yaz"}
              </button>
            </form>
            <div className="space-y-space-sm">
              {student.tasks.length === 0 ? <p className="text-body-sm text-on-surface-variant">Görev yok.</p> : null}
              {student.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-space-md rounded-lg bg-surface-container-low px-space-md py-space-sm">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-label-md font-bold ${task.done ? "bg-primary text-on-primary" : "bg-surface-container-highest text-primary"}`}>
                    {task.done ? "✓" : task.day}
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface">{task.title}</p>
                    <p className="text-body-sm text-on-surface-variant">{task.subject} · {task.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-space-lg lg:grid-cols-2">
            <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Denemeler</h3>
              {student.trials.length === 0 ? <p className="text-body-sm text-on-surface-variant">Deneme kaydı yok.</p> : null}
              <div className="space-y-space-sm">
                {student.trials.map((trial) => (
                  <div key={trial.id} className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                    <p className="font-semibold text-on-surface">{trial.name}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {trial.dateLabel} · TYT {trial.tyt} · AYT {trial.ayt} · {trial.delta}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Görüşmeler</h3>
              <form
                className="mb-space-md space-y-space-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  void addMeeting();
                }}
              >
                <label className="block text-label-md font-semibold text-on-surface">
                  Başlık
                  <input className="input-field mt-1" value={meetingTitle} onChange={(event) => setMeetingTitle(event.target.value)} />
                </label>
                <div className="grid grid-cols-2 gap-space-sm">
                  <label className="text-label-md font-semibold text-on-surface">
                    Tarih
                    <input className="input-field mt-1" type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} />
                  </label>
                  <label className="text-label-md font-semibold text-on-surface">
                    Saat
                    <input className="input-field mt-1" type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} />
                  </label>
                </div>
                <label className="block text-label-md font-semibold text-on-surface">
                  Tür
                  <select className="input-field mt-1" value={meetingType} onChange={(event) => setMeetingType(event.target.value as "online" | "check-in")}>
                    <option value="online">Online görüşme</option>
                    <option value="check-in">Kısa check-in</option>
                  </select>
                </label>
                <label className="block text-label-md font-semibold text-on-surface">
                  Not
                  <input className="input-field mt-1" value={meetingNote} onChange={(event) => setMeetingNote(event.target.value)} placeholder="İsteğe bağlı" />
                </label>
                <button type="submit" className="btn-primary" disabled={savingMeeting}>
                  <Icon name="event" className="text-[18px]" />
                  {savingMeeting ? "Kaydediliyor…" : "Randevu oluştur"}
                </button>
              </form>
              {student.meetings.length === 0 ? <p className="text-body-sm text-on-surface-variant">Görüşme yok.</p> : null}
              <div className="space-y-space-sm">
                {student.meetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                    <p className="font-semibold text-on-surface">{meeting.title}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {meeting.status === "requested"
                        ? "Öğrenci talep etti"
                        : `${meeting.dateLabel} ${meeting.time} · ${meeting.status === "upcoming" ? "Yaklaşan" : "Tamamlandı"}`}
                      {meeting.note ? ` · ${meeting.note}` : ""}
                    </p>
                    {meeting.meetUrl ? (
                      <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-label-md font-semibold text-primary">
                        Meet bağlantısı
                      </a>
                    ) : null}
                    {meeting.status === "requested" ? (
                      <form
                        className="mt-space-sm flex flex-wrap items-end gap-space-sm"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const data = new FormData(event.currentTarget);
                          void confirmMeeting(meeting.id, String(data.get("date") || ""), String(data.get("time") || ""));
                        }}
                      >
                        <input className="input-field" type="date" name="date" required aria-label="Randevu tarihi" />
                        <input className="input-field" type="time" name="time" defaultValue="19:00" required aria-label="Randevu saati" />
                        <button type="submit" className="btn-primary">
                          Randevuya çevir
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Koç notları</h3>
            {student.notes.length === 0 ? <p className="text-body-sm text-on-surface-variant">Henüz not yok.</p> : null}
            <div className="space-y-space-sm">
              {student.notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                  <p className="text-body-sm text-on-surface">{note.body}</p>
                  <p className="mt-1 text-label-md text-on-surface-variant">{note.author}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
