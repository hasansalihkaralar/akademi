"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { localIsoToday, localIsoTomorrow } from "@/lib/meeting-slots";

type Slot = {
  time: string;
  status: "free" | "meeting" | "blocked" | "busy";
  label: string;
  blockId: string | null;
};

function maxIso(days = 60) {
  const base = new Date(`${localIsoToday()}T12:00:00+03:00`);
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AdvisorAvailability() {
  const [date, setDate] = useState(() => localIsoTomorrow());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingTime, setPendingTime] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/panel/danisman/musaitlik?date=${encodeURIComponent(date)}`)
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as { slots?: Slot[]; error?: string } | null;
        if (cancelled) return;
        if (!response.ok) {
          setSlots([]);
          setError(data?.error || "Müsaitlik yüklenemedi.");
          return;
        }
        setSlots(data?.slots || []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setError("Müsaitlik yüklenemedi.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function reload() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/panel/danisman/musaitlik?date=${encodeURIComponent(date)}`);
    const data = (await response.json().catch(() => null)) as { slots?: Slot[]; error?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setSlots([]);
      setError(data?.error || "Müsaitlik yüklenemedi.");
      return;
    }
    setSlots(data?.slots || []);
  }

  async function toggle(slot: Slot) {
    if (slot.status === "meeting" || slot.status === "busy") return;
    setPendingTime(slot.time);
    setError("");
    setNotice("");

    if (slot.status === "blocked" && slot.blockId) {
      const response = await fetch("/api/panel/danisman/musaitlik", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.blockId }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setPendingTime("");
      if (!response.ok) {
        setError(data?.error || "Açılamadı.");
        return;
      }
      setNotice(`${slot.time} tekrar açıldı.`);
      await reload();
      return;
    }

    const response = await fetch("/api/panel/danisman/musaitlik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time: slot.time, note }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setPendingTime("");
    if (!response.ok) {
      setError(data?.error || "Kapatılamadı.");
      return;
    }
    setNotice(`${slot.time} randevuya kapatıldı.`);
    setNote("");
    await reload();
  }

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface">Saat kapat</h3>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Meşgul olduğun tarih ve saati kapat. Öğrenciler o dilimi (ve 45 dk tamponunu) seçemez. Kapalı saate tekrar tıklayınca açılır.
      </p>

      <div className="mt-space-md flex flex-wrap items-end gap-space-sm">
        <label className="text-label-md font-semibold text-on-surface">
          Tarih
          <input
            className="input-field mt-1"
            type="date"
            min={localIsoToday()}
            max={maxIso()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Not (isteğe bağlı)
          <input
            className="input-field mt-1 min-w-[200px]"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Örn. Toplantı / izin"
          />
        </label>
      </div>

      {error ? <p className="mt-space-sm text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="mt-space-sm text-body-sm text-primary">{notice}</p> : null}

      {loading ? (
        <p className="mt-space-md text-body-sm text-on-surface-variant">Saatler yükleniyor…</p>
      ) : (
        <div className="mt-space-md flex flex-wrap gap-2">
          {slots.map((slot) => {
            const blocked = slot.status === "blocked";
            const disabled = slot.status === "meeting" || slot.status === "busy";
            return (
              <button
                key={slot.time}
                type="button"
                disabled={disabled || pendingTime === slot.time}
                title={slot.label}
                onClick={() => void toggle(slot)}
                className={`rounded-lg px-3 py-2 text-label-md font-semibold ${
                  blocked
                    ? "bg-error/15 text-error"
                    : disabled
                      ? "cursor-not-allowed bg-surface-container text-on-surface-variant opacity-70"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                }`}
              >
                {pendingTime === slot.time ? "…" : slot.time}
                {blocked ? " · kapalı" : ""}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-space-sm text-body-sm text-on-surface-variant">
        <Icon name="info" className="mr-1 align-middle text-[16px]" />
        Kırmızı = kapalı · soluk = randevu/çakışma · diğerleri = tıklayınca kapanır
      </p>
    </section>
  );
}
