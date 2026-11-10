import { formatInTimeZone } from "date-fns-tz";
import { TZ } from "@/lib/format";

export type SessionPhaseName =
  | "upcoming"
  | "soon"
  | "open"
  | "live"
  | "overtime"
  | "closed"
  | "missed"
  | "cancelled"
  | "completed";

export type SessionEvent = { personId: string; event: "joined" | "left"; at: string };

export type SessionPhase = {
  phase: SessionPhaseName;
  join: "locked" | "now" | "rejoin" | "none";
  cancel: "ok" | "late" | "none";
  otherInCall: boolean;
  youInCall: boolean;
  youJoined: boolean;
  otherJoined: boolean;
  youJoinedAt: string | null;
  otherJoinedAt: string | null;
  opensAt: Date;
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

function presence(events: SessionEvent[], personId: string) {
  const mine = events.filter((event) => event.personId === personId).sort((a, b) => a.at.localeCompare(b.at));
  const last = mine.at(-1);
  return {
    inCall: last?.event === "joined",
    joined: mine.some((event) => event.event === "joined"),
    joinedAt: mine.find((event) => event.event === "joined")?.at ?? null,
  };
}

export function getSessionPhase(
  booking: { status: string; startsAt: string; endsAt: string; seekerId: string; retireeId: string; youId: string },
  events: SessionEvent[],
  appNow: Date,
): SessionPhase {
  const start = new Date(booking.startsAt).getTime();
  const end = new Date(booking.endsAt).getTime();
  const now = appNow.getTime();
  const you = presence(events, booking.youId);
  const otherId = booking.youId === booking.seekerId ? booking.retireeId : booking.seekerId;
  const other = presence(events, otherId);
  const opensAt = new Date(start - 10 * MIN);
  let phase: SessionPhaseName = "closed";
  if (booking.status === "cancelled" || booking.status === "expired") phase = "cancelled";
  else if (booking.status === "no_show_seeker" || booking.status === "no_show_retiree") phase = "missed";
  else if (booking.status === "completed") phase = "completed";
  else if (booking.status === "confirmed") {
    if (now < start - 24 * HOUR) phase = "upcoming";
    else if (now < start - 10 * MIN) phase = "soon";
    else if (now < start) phase = "open";
    else if (now < end) phase = "live";
    else if (now < end + 30 * MIN) phase = "overtime";
    else phase = "closed";
  }
  const join = phase === "open" || phase === "live" ? (you.inCall ? "rejoin" : "now") : phase === "overtime" ? "rejoin" : phase === "upcoming" || phase === "soon" ? "locked" : "none";
  const beforeStart = start - now;
  const cancel = phase === "upcoming" ? "ok" : phase === "soon" ? (beforeStart < 3 * HOUR ? "late" : "ok") : phase === "open" ? "late" : "none";
  return {
    phase,
    join,
    cancel,
    otherInCall: other.inCall,
    youInCall: you.inCall,
    youJoined: you.joined,
    otherJoined: other.joined,
    youJoinedAt: you.joinedAt,
    otherJoinedAt: other.joinedAt,
    opensAt,
  };
}

export function formatRemain(ms: number) {
  const total = Math.max(0, Math.ceil(ms / MIN));
  const days = Math.floor(total / (60 * 24));
  const hours = Math.floor((total % (60 * 24)) / 60);
  const mins = total % 60;
  if (days >= 2) return `${days} days`;
  if (days === 1) return hours ? `1 day ${hours}h` : "1 day";
  if (hours >= 1) return mins ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

export function joinOpensLabel(opensAt: Date) {
  return `Join opens ${formatInTimeZone(opensAt, TZ, "EEE d MMM")} at ${formatInTimeZone(opensAt, TZ, "HH:mm")}`;
}

export function startsInLabel(ms: number) {
  if (ms >= 24 * 60 * 60 * 1000) {
    const days = Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
    return days === 1 ? "1 day" : `${days} days`;
  }
  return formatRemain(ms);
}

export function activePhase(phase: SessionPhaseName) {
  return phase === "upcoming" || phase === "soon" || phase === "open" || phase === "live" || phase === "overtime";
}
