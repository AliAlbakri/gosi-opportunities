import { addRiyadhDays, atRiyadh, formatClock, formatMonthKey, riyadhParts } from "@/lib/format";
import type { ProfileState, RstStatus } from "@/lib/types";

export const SESSION_MS = 60 * 60 * 1000;
export const HOLD_MS = 10 * 60 * 1000;
export const RELEASE_MS = 48 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function deriveProfileState(statuses: RstStatus[]): Exclude<ProfileState, "paused"> {
  if (statuses.some((s) => s === "approved")) return "active";
  if (statuses.some((s) => s === "pending")) return "pending_review";
  if (statuses.some((s) => s === "not_approved")) return "not_approved";
  return "draft";
}

export function isLateCancel(appNow: Date, startsAt: Date) {
  return startsAt.getTime() - appNow.getTime() < 3 * 60 * 60 * 1000;
}

/** Sun–Thu count as working days. Friday and Saturday are the weekend. */
export function addWorkingDays(start: Date, days: number) {
  const cursor = new Date(start.getTime());
  let left = days;
  while (left > 0) {
    cursor.setTime(cursor.getTime() + DAY_MS);
    const weekday = riyadhParts(cursor).weekday;
    if (weekday !== 5 && weekday !== 6) left -= 1;
  }
  return cursor;
}

export function slotHours(startTime: string, endTime: string) {
  const [sh, sm] = startTime.slice(0, 5).split(":").map(Number);
  const [eh, em] = endTime.slice(0, 5).split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const hours: number[] = [];
  for (let h = 6; h <= 22; h++) {
    if (h * 60 >= startMin && (h + 1) * 60 <= endMin) hours.push(h);
  }
  return hours;
}

export type WindowInput = { weekday: number; start_time: string; end_time: string };

export function generateSlots(windows: WindowInput[], rangeStart: Date, rangeEnd: Date) {
  const slots: Date[] = [];
  let day = atRiyadh(riyadhParts(rangeStart).y, riyadhParts(rangeStart).m, riyadhParts(rangeStart).d, 12);
  const last = rangeEnd.getTime();
  for (let i = 0; i < 40 && day.getTime() <= last + DAY_MS; i++) {
    const parts = riyadhParts(day);
    for (const window of windows) {
      if (window.weekday !== parts.weekday) continue;
      for (const hour of slotHours(window.start_time, window.end_time)) {
        const slot = atRiyadh(parts.y, parts.m, parts.d, hour, 0);
        if (slot.getTime() >= rangeStart.getTime() && slot.getTime() <= rangeEnd.getTime()) slots.push(slot);
      }
    }
    day = addRiyadhDays(day, 1);
  }
  slots.sort((a, b) => a.getTime() - b.getTime());
  return slots;
}

export function monthEndTarget(appNow: Date) {
  const build = (y: number, m: number) => {
    const nextY = m === 12 ? y + 1 : y;
    const nextM = m === 12 ? 1 : m + 1;
    const first = atRiyadh(nextY, nextM, 1, 0, 0);
    const last = new Date(first.getTime() - 60 * 1000);
    const p = riyadhParts(last);
    return atRiyadh(p.y, p.m, p.d, 23, 55);
  };
  const p = riyadhParts(appNow);
  let target = build(p.y, p.m);
  if (target.getTime() <= appNow.getTime()) {
    const ny = p.m === 12 ? p.y + 1 : p.y;
    const nm = p.m === 12 ? 1 : p.m + 1;
    target = build(ny, nm);
  }
  return target;
}

export function isMonthEndWindow(appNow: Date) {
  const p = riyadhParts(appNow);
  const next = riyadhParts(addRiyadhDays(atRiyadh(p.y, p.m, p.d, 12), 1));
  if (next.m === p.m) return false;
  return formatClock(appNow) >= "23:55";
}

export function previousMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  const ny = m === 1 ? y - 1 : y;
  const nm = m === 1 ? 12 : m - 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** Month to settle now, or null. Month-end (23:55) settles the current month so the demo button pays out. */
export function settlementMonthDue(appNow: Date, last: string | null) {
  const currentKey = formatMonthKey(appNow);
  if (isMonthEndWindow(appNow) && (last == null || last < currentKey)) return currentKey;
  const prev = previousMonthKey(currentKey);
  if (last == null || last < prev) return prev;
  return null;
}

export function yearsOfEmployment(
  rows: { start_date: string; end_date: string | null }[],
  appNow: Date,
) {
  return rows.reduce((sum, row) => {
    const start = new Date(`${row.start_date}T00:00:00Z`).getTime();
    const end = row.end_date ? new Date(`${row.end_date}T00:00:00Z`).getTime() : appNow.getTime();
    return sum + Math.max(0, (end - start) / (365.25 * DAY_MS));
  }, 0);
}

export function checklistDone(
  profile: { onboarding_watched_at: string | null; readiness_passed_at: string | null },
  windowCount: number,
) {
  return Boolean(profile.onboarding_watched_at && profile.readiness_passed_at && windowCount > 0);
}
