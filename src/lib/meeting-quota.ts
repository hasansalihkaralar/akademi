import { getPackage } from "@/lib/content";
import { isoDate, meetingLabelToIso, parseIsoDate, startOfWeek, weekStartIso } from "@/lib/meeting-date";

const PARENT_TITLES = new Set(["Veli görüşme talebi", "Veli görüşmesi"]);
const MEET_COOLDOWN_DAYS = 7;

export type QuotaMeeting = {
  title: string;
  status: string;
  dateLabel: string;
  time?: string | null;
  meetUrl?: string | null;
};

export type MeetingQuotaSummary = {
  packageId: string | null;
  packageName: string | null;
  total: number;
  used: number;
  remaining: number;
  weeklyLimit: number;
  weekUsed: boolean;
  weekLabel: string;
  cooldownUntil: string | null;
  cooldownUntilLabel: string | null;
  canBook: boolean;
  reason: string | null;
};

/** Sabit paket kotaları: 1 ay=4, 3 ay=12, 6 ay=24. Sınava kadar = hafta sayısı. */
export function fixedPackageQuota(packageId: string): number | null {
  if (packageId.endsWith("-aylik")) return 4;
  if (packageId.includes("-3ay")) return 12;
  if (packageId.includes("-6ay")) return 24;
  if (packageId.includes("-yillik")) return null;
  return null;
}

export function examDateForPackage(packageId: string, from = new Date()) {
  const isLgs = packageId.startsWith("lgs");
  const month = 5; // Haziran
  const day = isLgs ? 7 : 21;
  let year = from.getFullYear();
  const exam = new Date(year, month, day);
  if (exam.getTime() <= from.getTime()) {
    year += 1;
  }
  return new Date(year, month, day);
}

/** Paket başlangıcına göre bitiş tarihi. Sınava kadar paketlerde sınav tarihi kullanılır. */
export function packageEndDate(packageId: string, startedAt: Date) {
  const pack = getPackage(packageId);
  if (!pack) return null;
  if (packageId.includes("-yillik") || pack.duration.toLowerCase().includes("sınava")) {
    return examDateForPackage(packageId, startedAt);
  }
  const end = new Date(startedAt);
  end.setMonth(end.getMonth() + (pack.months || 1));
  return end;
}

export function formatTrDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function weeksUntilExam(packageId: string, startedAt: Date, from = new Date()) {
  const exam = examDateForPackage(packageId, from);
  const start = startOfWeek(startedAt);
  const end = startOfWeek(exam);
  if (end.getTime() < start.getTime()) return 1;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export function packageMeetingTotal(packageId: string, startedAt: Date, from = new Date()) {
  const fixed = fixedPackageQuota(packageId);
  if (fixed != null) return fixed;
  if (packageId.includes("-yillik")) return weeksUntilExam(packageId, startedAt, from);
  return 0;
}

export function isStudentQuotaMeeting(meeting: QuotaMeeting) {
  if (PARENT_TITLES.has(meeting.title)) return false;
  return meeting.status === "upcoming" || meeting.status === "done";
}

export function isMeetQuotaMeeting(meeting: QuotaMeeting) {
  if (PARENT_TITLES.has(meeting.title)) return false;
  if (!meeting.meetUrl) return false;
  return meeting.status === "upcoming" || meeting.status === "done" || meeting.status === "missed";
}

export function meetingWeekStart(dateLabel: string, isoFallback?: string) {
  if (isoFallback) {
    const parsed = parseIsoDate(isoFallback);
    if (parsed) return weekStartIso(parsed);
  }
  const iso = meetingLabelToIso(dateLabel);
  const parsed = parseIsoDate(iso);
  return parsed ? weekStartIso(parsed) : null;
}

function istanbulYear(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric" }).format(now),
  );
}

/** Meet görüşmesinin Istanbul anı (ms). */
export function meetingInstantMs(dateLabel: string, time: string | null | undefined, now = new Date()) {
  const raw = (time || "00:00").trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const yearNow = istanbulYear(now);

  let best: number | null = null;
  for (const year of [yearNow, yearNow - 1, yearNow + 1]) {
    const iso = meetingLabelToIso(dateLabel, year);
    const date = parseIsoDate(iso);
    if (!date) continue;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    const ms = Date.parse(`${y}-${m}-${d}T${hh}:${mm}:00+03:00`);
    if (Number.isNaN(ms)) continue;
    if (best == null || Math.abs(ms - now.getTime()) < Math.abs(best - now.getTime())) {
      best = ms;
    }
  }
  return best;
}

function addDaysIso(iso: string, days: number) {
  const date = parseIsoDate(iso);
  if (!date) return null;
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

/** Son Meet toplantısından sonraki 7 gün dolana kadar yeni randevu engeli. */
export function meetCooldown(meetings: QuotaMeeting[], now = new Date()) {
  let latestMs: number | null = null;
  for (const meeting of meetings) {
    if (!isMeetQuotaMeeting(meeting)) continue;
    const ms = meetingInstantMs(meeting.dateLabel, meeting.time, now);
    if (ms == null) continue;
    if (latestMs == null || ms > latestMs) latestMs = ms;
  }
  if (latestMs == null) {
    return { active: false, untilIso: null as string | null, untilLabel: null as string | null };
  }

  const meetingDate = new Date(latestMs);
  const meetingIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(meetingDate);
  const untilIso = addDaysIso(meetingIso, MEET_COOLDOWN_DAYS);
  if (!untilIso) {
    return { active: false, untilIso: null, untilLabel: null };
  }

  const todayIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const active = todayIso < untilIso;
  return {
    active,
    untilIso: active ? untilIso : null,
    untilLabel: active ? formatTrDate(parseIsoDate(untilIso)) : null,
  };
}

export function summarizeMeetingQuota(input: {
  packageId: string | null | undefined;
  packageStartedAt: Date | null | undefined;
  packageName?: string | null;
  meetings: QuotaMeeting[];
  targetDateIso?: string;
}): MeetingQuotaSummary {
  const packageId = input.packageId || null;
  const pack = packageId ? getPackage(packageId) : undefined;
  const startedAt = input.packageStartedAt || new Date();
  const total = packageId ? packageMeetingTotal(packageId, startedAt) : 0;
  const counted = input.meetings.filter(isStudentQuotaMeeting);
  const used = counted.length;
  const remaining = Math.max(0, total - used);

  const cooldown = meetCooldown(input.meetings);
  const targetBlocked = Boolean(
    input.targetDateIso && cooldown.untilIso && input.targetDateIso < cooldown.untilIso,
  );
  const cooldownBlocks = input.targetDateIso ? targetBlocked : cooldown.active;

  let reason: string | null = null;
  if (!packageId) reason = "Paketi tanımlı değil. Yönetim kaydını kontrol et.";
  else if (remaining <= 0) reason = "Paket toplantı hakkın bitti.";
  else if (cooldownBlocks && cooldown.untilLabel) {
    reason = `Google Meet görüşmesinden sonra 7 gün beklemen gerekir. En erken ${cooldown.untilLabel} tarihinden itibaren randevu alabilirsin.`;
  }

  return {
    packageId,
    packageName: input.packageName || pack?.name || null,
    total,
    used,
    remaining,
    weeklyLimit: 1,
    weekUsed: cooldown.active,
    weekLabel: cooldown.untilIso || weekStartIso(),
    cooldownUntil: cooldown.untilIso,
    cooldownUntilLabel: cooldown.untilLabel,
    canBook: Boolean(packageId) && remaining > 0 && !cooldownBlocks,
    reason:
      !packageId || remaining <= 0
        ? reason
        : cooldownBlocks
          ? reason
          : null,
  };
}

export function packageStartedLabel(date: Date | null | undefined) {
  if (!date) return null;
  return isoDate(date);
}
