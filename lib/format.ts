import { formatDistance } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const TZ = process.env.APP_TIMEZONE || "Asia/Riyadh";

export function formatWhen(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "EEE d MMM, HH:mm");
}

export function formatDay(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "EEE d MMM");
}

export function formatClock(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "HH:mm");
}

export function formatLong(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "EEE d MMM yyyy, HH:mm");
}

export function formatMonth(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "MMMM yyyy");
}

export function formatMonthKey(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "yyyy-MM");
}

export function formatReviewMonth(date: Date | string) {
  return formatInTimeZone(new Date(date), TZ, "MMMM yyyy");
}

export function formatSpan(start: string, end: string | null) {
  const label = (value: string) => {
    const [year, month] = value.slice(0, 10).split("-").map(Number);
    return formatInTimeZone(new Date(Date.UTC(year, month - 1, 15)), TZ, "MMM yyyy");
  };
  return end ? `${label(start)} – ${label(end)}` : label(start);
}

export function relativeDay(date: Date | string, appNow: Date) {
  const day = formatInTimeZone(new Date(date), TZ, "yyyy-MM-dd");
  const today = formatInTimeZone(appNow, TZ, "yyyy-MM-dd");
  const tomorrow = formatInTimeZone(addRiyadhDays(appNow, 1), TZ, "yyyy-MM-dd");
  const time = formatClock(date);
  if (day === today) return `Today, ${time}`;
  if (day === tomorrow) return `Tomorrow, ${time}`;
  return formatWhen(date);
}

export function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function money(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "SAR 0";
  return Number.isInteger(n) ? `SAR ${n}` : `SAR ${n.toFixed(2)}`;
}

export function relativeTo(date: Date | string, appNow: Date) {
  return formatDistance(new Date(date), appNow, { addSuffix: true });
}

export function greeting(appNow: Date) {
  const hour = Number(formatInTimeZone(appNow, TZ, "H"));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function ageInRiyadh(birthDate: string, appNow: Date) {
  const today = formatInTimeZone(appNow, TZ, "yyyy-MM-dd");
  const [ty, tm, td] = today.split("-").map(Number);
  const [by, bm, bd] = birthDate.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}

export function riyadhParts(date: Date) {
  const [y, m, d] = formatInTimeZone(date, TZ, "yyyy-MM-dd").split("-").map(Number);
  const iso = Number(formatInTimeZone(date, TZ, "i"));
  const weekday = iso % 7;
  return { y, m, d, weekday };
}

export function atRiyadh(y: number, m: number, d: number, h: number, min = 0) {
  const dt = new Date(Date.UTC(y, m - 1, 1));
  dt.setUTCDate(d);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  const mi = String(min).padStart(2, "0");
  return fromZonedTime(`${yy}-${mm}-${dd}T${hh}:${mi}:00`, TZ);
}

export function addRiyadhDays(date: Date, days: number) {
  const p = riyadhParts(date);
  return atRiyadh(p.y, p.m, p.d + days, 12, 0);
}
