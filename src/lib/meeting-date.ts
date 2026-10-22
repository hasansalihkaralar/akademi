const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.map((name, index) => [name, index]));

export function parseMeetingDate(label: string, year = new Date().getFullYear()) {
  const match = /^(\d{1,2}) (Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)$/.exec(label.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTH_INDEX[match[2]];
  const date = new Date(year, month, day);
  if (date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

export function sameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = start.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + mondayOffset);
  return start;
}

export const PROGRAM_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

const MONTHS_LONG = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (isoDate(date) !== value) return null;
  return date;
}

export function weekStartIso(date = new Date()) {
  return isoDate(startOfWeek(date));
}

export function isMondayIso(value: string) {
  const date = parseIsoDate(value);
  return Boolean(date && date.getDay() === 1);
}

export function shiftWeekIso(value: string, weeks: number) {
  const date = parseIsoDate(value) ?? startOfWeek(new Date());
  date.setDate(date.getDate() + weeks * 7);
  return isoDate(date);
}

export function weekRangeLabel(mondayIso: string) {
  const start = parseIsoDate(mondayIso);
  if (!start) return mondayIso;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_LONG[start.getMonth()]} – ${end.getDate()} ${MONTHS_LONG[end.getMonth()]} ${end.getFullYear()}`;
}

export function meetingDateLabel(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${day} ${MONTHS[month - 1]}`;
}
