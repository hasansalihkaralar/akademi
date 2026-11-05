"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type MeetingRow = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  grade: string;
  program: string;
  title: string;
  dateLabel: string;
  time: string;
  meetUrl: string | null;
  status: string;
  attendance: "yapildi" | "yapilmadi" | null;
  advisorNote: string | null;
};

export default function AdvisorCheckMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/panel/danisman/ara-gorusmeler", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setError("Ara görüşmeler yüklenemedi.");
          return;
        }
        const data = (await response.json()) as { meetings: MeetingRow[] };
        setMeetings(data.meetings);
        setNotes(
          Object.fromEntries(data.meetings.map((item) => [item.id, item.advisorNote || ""])),
        );
        setError("");
      })
      .catch(() => setError("Ara görüşmeler yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function setAttendance(id: string, attendance: "yapildi" | "yapilmadi") {
    setSavingId(id);
    setError("");
    const response = await fetch("/api/panel/danisman/ara-gorusmeler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        id,
        attendance,
        advisorNote: notes[id] || "",
      }),
    });
    if (!response.ok) {
      setError("Durum kaydedilemedi.");
      setSavingId(null);
      return;
    }
    const data = (await response.json()) as {
      id: string;
      attendance: "yapildi" | "yapilmadi";
      status: string;
      advisorNote: string | null;
    };
    setMeetings((prev) =>
      prev.map((item) =>
        item.id === data.id
          ? {
              ...item,
              attendance: data.attendance,
              status: data.status,
              advisorNote: data.advisorNote,
            }
          : item,
      ),
    );
    setNotes((prev) => ({ ...prev, [data.id]: data.advisorNote || "" }));
    setSavingId(null);
  }

  const pending = meetings.filter((item) => !item.attendance).length;

  return (
    <div className="space-y-space-lg">
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">Ara Görüşme</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Meet tarihi ve saati geçen görüşmeler burada listelenir. Randevu oluşturulunca değil;
          toplantı zamanı geçtikten sonra kontrol için çıkar. Öğrenciyle görüşme yapıldı / yapılmadı
          işaretle; gerekirse açıklama yaz.
        </p>
        <div className="mt-space-md flex flex-wrap gap-space-sm text-label-md">
          <span className="rounded-full bg-surface-container px-3 py-1 font-semibold text-on-surface">
            Toplam {meetings.length}
          </span>
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1 font-semibold text-[#B45309]">
            Kontrol bekleyen {pending}
          </span>
        </div>
      </section>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {loading ? <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p> : null}

      {!loading && meetings.length === 0 ? (
        <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
          <p className="text-title-md font-semibold text-on-surface">Kontrol bekleyen geçmiş görüşme yok</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Meet’li randevular, tarih ve saati geçtikten sonra burada görünür.
          </p>
        </section>
      ) : null}

      <div className="space-y-space-md">
        {meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-space-md">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <h3 className="text-title-lg font-bold text-on-surface">{meeting.studentName}</h3>
                  {meeting.attendance === "yapildi" ? (
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-label-md font-bold text-[#15803D]">
                      Yapıldı
                    </span>
                  ) : meeting.attendance === "yapilmadi" ? (
                    <span className="rounded-full bg-error/10 px-2 py-0.5 text-label-md font-bold text-error">
                      Yapılmadı
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-label-md font-bold text-[#B45309]">
                      Kontrol bekliyor
                    </span>
                  )}
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {meeting.grade} · {meeting.program}
                </p>
                <p className="mt-space-xs text-body-sm text-on-surface-variant">
                  {meeting.studentEmail}
                  {meeting.studentPhone ? ` · ${meeting.studentPhone}` : ""}
                </p>
                <div className="mt-space-md grid gap-space-sm sm:grid-cols-3">
                  <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                    <p className="text-label-md text-on-surface-variant">Görüşme</p>
                    <p className="font-semibold text-on-surface">{meeting.title}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                    <p className="text-label-md text-on-surface-variant">Tarih</p>
                    <p className="font-semibold text-on-surface">{meeting.dateLabel}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                    <p className="text-label-md text-on-surface-variant">Saat</p>
                    <p className="font-semibold text-on-surface">{meeting.time}</p>
                  </div>
                </div>
                <div className="mt-space-md flex flex-wrap gap-space-sm">
                  <Link
                    href={`/panel/danisman/ogrenciler/${meeting.studentId}`}
                    className="inline-flex items-center gap-1 text-label-md font-semibold text-primary"
                  >
                    <Icon name="person" className="text-[16px]" />
                    Öğrenci detayı
                  </Link>
                  {meeting.meetUrl ? (
                    <a
                      href={meeting.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-label-md font-semibold text-primary"
                    >
                      <Icon name="videocam" className="text-[16px]" />
                      Meet linki
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full flex-col gap-space-sm sm:w-auto sm:min-w-[240px] sm:max-w-sm">
                <p className="text-label-md font-semibold text-on-surface">Görüşme kontrolü</p>
                <button
                  type="button"
                  disabled={savingId === meeting.id}
                  onClick={() => setAttendance(meeting.id, "yapildi")}
                  className={`rounded-lg px-space-md py-2.5 text-label-md font-semibold transition disabled:opacity-60 ${
                    meeting.attendance === "yapildi"
                      ? "bg-[#15803D] text-white"
                      : "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
                  }`}
                >
                  Görüşme yapıldı
                </button>
                <button
                  type="button"
                  disabled={savingId === meeting.id}
                  onClick={() => setAttendance(meeting.id, "yapilmadi")}
                  className={`rounded-lg px-space-md py-2.5 text-label-md font-semibold transition disabled:opacity-60 ${
                    meeting.attendance === "yapilmadi"
                      ? "bg-error text-on-error"
                      : "bg-error/10 text-error hover:bg-error/20"
                  }`}
                >
                  Görüşme yapılmadı
                </button>
                <label className="text-label-md font-semibold text-on-surface">
                  Açıklama
                  <textarea
                    rows={3}
                    value={notes[meeting.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [meeting.id]: e.target.value }))
                    }
                    placeholder={
                      meeting.attendance === "yapilmadi"
                        ? "Görüşme neden yapılmadı?"
                        : "Görüşmeyle ilgili notun varsa yaz…"
                    }
                    className="input-field mt-1 min-h-[84px] resize-y py-2"
                  />
                </label>
                <p className="text-[11px] text-on-surface-variant">
                  Açıklama, yukarıdaki durum butonuna bastığında kaydedilir.
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
