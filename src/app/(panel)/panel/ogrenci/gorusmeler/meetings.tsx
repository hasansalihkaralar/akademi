"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type Quota = {
  packageName: string | null;
  used: number;
  total: number;
  remaining: number;
  weekUsed: boolean;
  canBook: boolean;
  reason: string | null;
  cooldownUntil?: string | null;
  cooldownUntilLabel?: string | null;
};

function todayIso() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;
}

function tomorrowIso() {
  const base = new Date(`${todayIso()}T12:00:00+03:00`);
  base.setDate(base.getDate() + 1);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function maxIso(days = 21) {
  const base = new Date(`${todayIso()}T12:00:00+03:00`);
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function StudentMeetings() {
  const router = useRouter();
  const [coach, setCoach] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [date, setDate] = useState(tomorrowIso);
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/panel/ogrenci/gorusmeler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Görüşmeleri görmek için öğrenci hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as {
          coach: string;
          viewer?: string;
          meetings: Meeting[];
          quota?: Quota;
        };
        if (data.viewer === "veli") {
          router.replace("/panel/ogrenci");
          return;
        }
        setCoach(data.coach);
        setMeetings(data.meetings);
        setQuota(data.quota || null);
        setAllowed(true);
      })
      .catch(() => setError("Görüşmeler yüklenemedi."));
  }, [router]);

  useEffect(() => {
    if (!allowed || !date) return;
    setLoadingSlots(true);
    setTime("");
    setError("");
    fetch(`/api/panel/ogrenci/randevu-slotlari?date=${encodeURIComponent(date)}`)
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as { slots?: string[]; error?: string } | null;
        if (!response.ok) {
          setSlots([]);
          setError(data?.error || "Müsait saatler yüklenemedi.");
          return;
        }
        setSlots(data?.slots || []);
      })
      .catch(() => {
        setSlots([]);
        setError("Müsait saatler yüklenemedi.");
      })
      .finally(() => setLoadingSlots(false));
  }, [allowed, date]);

  async function bookMeeting() {
    if (!date || !time) return;
    setSaving(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/ogrenci/gorusmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, note }),
    });
    const data = (await response.json().catch(() => null)) as
      | { coach?: string; meetings?: Meeting[]; quota?: Quota; error?: string }
      | null;
    setSaving(false);
    if (!response.ok || !data?.meetings) {
      setError(data?.error || "Randevu alınamadı.");
      return;
    }
    setCoach(data.coach || coach);
    setMeetings(data.meetings);
    if (data.quota) setQuota(data.quota);
    setNote("");
    setTime("");
    setNotice("Randevu alındı. Toplantıya katıl linki hazır.");
    const slotsResponse = await fetch(`/api/panel/ogrenci/randevu-slotlari?date=${encodeURIComponent(date)}`);
    const slotsData = (await slotsResponse.json().catch(() => null)) as { slots?: string[] } | null;
    if (slotsResponse.ok) setSlots(slotsData?.slots || []);
  }

  if (!allowed) {
    return error ? <p className="text-body-sm text-error">{error}</p> : null;
  }

  const dateBlockedByCooldown = Boolean(quota?.cooldownUntil && date < quota.cooldownUntil);
  const bookingBlocked = Boolean(quota && (quota.remaining <= 0 || dateBlockedByCooldown));
  const cooldownMessage =
    dateBlockedByCooldown && quota?.cooldownUntilLabel
      ? `Google Meet görüşmesinden sonra 7 gün beklemen gerekir. En erken ${quota.cooldownUntilLabel} tarihinden itibaren randevu alabilirsin.`
      : null;

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Görüşmeler</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Danışman {coach || "…"} için en erken yarından itibaren, 12:00–21:00 arası 15 dakikalık dilimlerden randevu al. Google Meet görüşmesinden sonra 7 gün yeni randevu alınamaz; seçilen saatten sonraki 45 dk kapanır.
        </p>
        {quota ? (
          <p className="mt-space-sm text-body-sm text-on-surface">
            <span className="font-semibold">Toplantı hakkı:</span> {quota.used}/{quota.total} · kalan {quota.remaining}
            {quota.packageName ? ` · ${quota.packageName}` : ""}
            {quota.cooldownUntilLabel ? ` · Meet sonrası 7 gün · en erken ${quota.cooldownUntilLabel}` : ""}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      {quota && quota.remaining <= 0 && quota.reason ? (
        <p className="text-body-sm text-error">{quota.reason}</p>
      ) : null}
      {cooldownMessage ? <p className="text-body-sm text-error">{cooldownMessage}</p> : null}

      <form
        className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void bookMeeting();
        }}
      >
        <label className="block text-label-md font-semibold text-on-surface">
          Tarih
          <input
            className="input-field mt-1"
            type="date"
            required
            min={tomorrowIso()}
            max={maxIso()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <div className="mt-space-md">
          <p className="text-label-md font-semibold text-on-surface">Müsait saat</p>
          {loadingSlots ? (
            <p className="mt-2 text-body-sm text-on-surface-variant">Saatler yükleniyor…</p>
          ) : slots.length === 0 ? (
            <p className="mt-2 text-body-sm text-on-surface-variant">Bu gün için müsait saat yok.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => {
                const selected = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-lg px-3 py-2 text-label-md font-semibold ${
                      selected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="mt-space-md block text-label-md font-semibold text-on-surface">
          Not (isteğe bağlı)
          <textarea
            className="input-field mt-1 h-24 py-3"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Örn. Deneme analizi konuşalım"
          />
        </label>
        <button
          type="submit"
          className="btn-primary mt-space-md"
          disabled={saving || !time || bookingBlocked}
        >
          <Icon name="event_available" className="text-[18px]" />
          {saving ? "Randevu ve Meet oluşturuluyor…" : "Randevu al"}
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
                    ? " · Eski talep (danışman yanıtlayacak)"
                    : ` · ${meeting.dateLabel} · ${meeting.time}`}
                </p>
                {meeting.note ? <p className="mt-1 text-body-sm text-on-surface">{meeting.note}</p> : null}
              </div>
            </div>
            <div className="flex flex-col items-start gap-space-sm sm:items-end">
              {meeting.meetUrl && meeting.status === "upcoming" ? (
                <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="btn-primary">
                  <Icon name="videocam" className="text-[18px]" />
                  Toplantıya katıl
                </a>
              ) : null}
              <span className="rounded-full bg-surface-container px-space-md py-2 text-label-md font-semibold text-on-surface-variant">
                {meeting.status === "requested"
                  ? "Talep iletildi"
                  : meeting.status === "upcoming"
                    ? "Yaklaşan"
                    : "Tamamlandı"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
