/** Randevu başlangıç aralığı: 12:00–21:00, 15 dk. Alınan saat + sonraki 45 dk bloklanır (toplam 60 dk). */

export const SLOT_START_MINUTES = 12 * 60;
export const SLOT_END_MINUTES = 21 * 60;
export const SLOT_STEP_MINUTES = 15;
export const MEETING_BLOCK_MINUTES = 60;

export function timeToMinutes(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function allDaySlots() {
  const slots: string[] = [];
  for (let minute = SLOT_START_MINUTES; minute <= SLOT_END_MINUTES; minute += SLOT_STEP_MINUTES) {
    slots.push(minutesToTime(minute));
  }
  return slots;
}

export function isBookableSlot(time: string) {
  const minutes = timeToMinutes(time);
  if (minutes == null) return false;
  if (minutes < SLOT_START_MINUTES || minutes > SLOT_END_MINUTES) return false;
  return (minutes - SLOT_START_MINUTES) % SLOT_STEP_MINUTES === 0;
}

export function bookingWindow(time: string) {
  const start = timeToMinutes(time);
  if (start == null) return null;
  return { start, end: start + MEETING_BLOCK_MINUTES };
}

/** İki randevu başlangıcı 60 dk'lık bloklarıyla çakışıyor mu? */
export function slotsConflict(a: string, b: string) {
  const left = bookingWindow(a);
  const right = bookingWindow(b);
  if (!left || !right) return true;
  return left.start < right.end && right.start < left.end;
}

export function conflictsWithTaken(candidate: string, takenTimes: string[]) {
  return takenTimes.some((taken) => slotsConflict(candidate, taken));
}

export function availableSlots(takenTimes: string[], options?: { notBeforeMinutes?: number }) {
  const floor = options?.notBeforeMinutes;
  return allDaySlots().filter((slot) => {
    const minutes = timeToMinutes(slot);
    if (minutes == null) return false;
    if (floor != null && minutes < floor) return false;
    return !conflictsWithTaken(slot, takenTimes);
  });
}

/** Europe/Istanbul duyarlı bugünün dakika-of-day (yerel). */
export function localMinutesNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function localIsoToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/** Bugünden bir sonraki gün (Europe/Istanbul). Aynı güne randevu alınamaz. */
export function localIsoTomorrow(now = new Date()) {
  const today = localIsoToday(now);
  const next = new Date(`${today}T12:00:00+03:00`);
  next.setDate(next.getDate() + 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
