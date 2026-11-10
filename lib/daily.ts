import { copy } from "@/lib/copy";

const BASE = "https://api.daily.co/v1";

// Daily includes this many participant-minutes each calendar month, then bills $0.004. One person present for one minute is one participant-minute. https://www.daily.co/pricing/video-sdk/
const FREE_PARTICIPANT_MINUTES = 10_000;
const FREE_PARTICIPANT_SECONDS = FREE_PARTICIPANT_MINUTES * 60;

type Participant = { duration?: number; join_time?: number };
type DailyMeeting = {
  id?: string;
  room?: string;
  start_time?: number;
  duration?: number;
  ongoing?: boolean;
  max_participants?: number;
  participants?: Participant[];
};
type Hold = { until: number; slots: number };
type RoomState = { ok: true; exp: number | null } | { ok: false; missing: boolean; error: string };

const holds = new Map<string, Hold>();
let gate: Promise<void> = Promise.resolve();

export function hasDaily() {
  return Boolean(process.env.DAILY_API_KEY && process.env.DAILY_DOMAIN);
}

function fail(error: string) {
  return { ok: false as const, error };
}

function billedSeconds(duration: number) {
  return Math.ceil(Math.max(0, duration) / 60) * 60;
}

function meetingSeconds(meeting: DailyMeeting, now: number) {
  if (meeting.participants?.length) {
    return meeting.participants.reduce((sum, person) => {
      const live = meeting.ongoing && person.join_time ? Math.max(0, now - person.join_time) : 0;
      return sum + billedSeconds(Math.max(person.duration ?? 0, live));
    }, 0);
  }
  const live = meeting.ongoing && meeting.start_time ? Math.max(0, now - meeting.start_time) : 0;
  const people = Math.max(1, meeting.max_participants ?? 1);
  return billedSeconds(Math.max(meeting.duration ?? 0, live)) * people;
}

function withDailyLock<T>(work: () => Promise<T>) {
  const previous = gate;
  let release = () => {};
  gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  return previous.then(work).finally(release);
}

async function dailyFetch(path: string, body?: unknown) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string; info?: string; token?: string };
  if (!response.ok) console.error("Daily API", path, response.status, JSON.stringify(payload));
  return { ok: response.ok, status: response.status, payload };
}

async function getRoom(name: string): Promise<RoomState> {
  if (!hasDaily()) return { ok: false, missing: false, error: "Daily.co is not configured." };
  try {
    const response = await fetch(`${BASE}/rooms/${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    });
    const payload = (await response.json().catch(() => ({}))) as { config?: { exp?: number }; error?: string; info?: string };
    if (response.status === 404) return { ok: false, missing: true, error: "missing" };
    if (!response.ok) {
      console.error("Daily API", `/rooms/${name}`, response.status, JSON.stringify(payload));
      return { ok: false, missing: false, error: payload.error || payload.info || copy.dailyUsageUnknown };
    }
    return { ok: true, exp: payload.config?.exp ?? null };
  } catch {
    return { ok: false, missing: false, error: copy.dailyUsageUnknown };
  }
}

const roomProperties = (expUnix: number) => ({
  exp: expUnix,
  enable_screenshare: true,
  enable_chat: false,
  enable_recording: false,
  enable_prejoin_ui: false,
});

async function writeRoomExp(name: string, expUnix: number) {
  const updated = await dailyFetch(`/rooms/${encodeURIComponent(name)}`, { properties: roomProperties(expUnix) });
  if (!updated.ok) return fail(updated.payload.error || updated.payload.info || "Could not update the video room.");
  return { ok: true as const, name };
}

async function deleteRoom(name: string) {
  const response = await fetch(`${BASE}/rooms/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
  });
  if (response.status === 404) return;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) console.error("Daily API", `DELETE /rooms/${name}`, response.status, JSON.stringify(payload));
}

async function createRoom(name: string, expUnix: number) {
  const created = await dailyFetch("/rooms", {
    name,
    privacy: "private",
    properties: roomProperties(expUnix),
  });
  if (created.ok) return { ok: true as const, name };
  const info = `${created.payload.error ?? ""} ${created.payload.info ?? ""}`;
  if (!/already exists/i.test(info)) return fail(created.payload.error || created.payload.info || "Could not create the video room.");
  return writeRoomExp(name, expUnix);
}

export async function ensureRoom(name: string, expUnix: number, update: "keep" | "set" = "keep") {
  if (!hasDaily()) return fail("Daily.co is not configured.");
  const existing = await getRoom(name);
  const now = Math.floor(Date.now() / 1000);
  if (existing.ok && existing.exp != null && existing.exp <= now) {
    await deleteRoom(name);
    return createRoom(name, expUnix);
  }
  if (existing.ok) {
    if (update === "keep") return { ok: true as const, name };
    if (existing.exp === expUnix) {
      const aligned = await writeRoomExp(name, expUnix);
      if (aligned.ok) return aligned;
    }
    const updated = await writeRoomExp(name, expUnix);
    if (updated.ok) return updated;
    await deleteRoom(name);
    return createRoom(name, expUnix);
  }
  if (!existing.missing) return fail(existing.error);
  return createRoom(name, expUnix);
}

/** Creates a private room and deletes it. Used by /tech/health. */
export async function probeDailyRoom() {
  const name = `health-${Date.now().toString(36)}`;
  const exp = Math.floor(Date.now() / 1000) + 120;
  const created = await ensureRoom(name, exp, "set");
  if (!created.ok) return created;
  await deleteRoom(name);
  return { ok: true as const };
}

async function listMonthMeetings(now: number) {
  const start = Math.floor(Date.UTC(new Date(now * 1000).getUTCFullYear(), new Date(now * 1000).getUTCMonth(), 1) / 1000);
  const seen = new Set<string>();
  const data: DailyMeeting[] = [];
  let startingAfter = "";
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({ timeframe_start: String(start), limit: "100" });
    if (startingAfter) params.set("starting_after", startingAfter);
    let response: Response;
    try {
      response = await fetch(`${BASE}/meetings?${params}`, {
        headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
      });
    } catch {
      return fail(copy.dailyUsageUnknown);
    }
    const payload = (await response.json().catch(() => ({}))) as { data?: DailyMeeting[] };
    if (!response.ok || !payload.data) return fail(copy.dailyUsageUnknown);
    let added = 0;
    for (const meeting of payload.data) {
      if (!meeting.id || seen.has(meeting.id)) continue;
      seen.add(meeting.id);
      data.push(meeting);
      added += 1;
    }
    if (payload.data.length > 0 && added === 0) return fail(copy.dailyUsageUnknown);
    if (payload.data.length < 100) return { ok: true as const, data };
    startingAfter = payload.data.at(-1)?.id ?? "";
    if (!startingAfter) return fail(copy.dailyUsageUnknown);
  }
  return fail(copy.dailyUsageUnknown);
}

async function reservedSeconds(now: number, room: string, meetings: DailyMeeting[]) {
  let seconds = 0;
  const covered = new Set<string>();
  for (const [name, hold] of holds) {
    if (name === room || hold.until <= now) continue;
    covered.add(name);
    seconds += hold.slots * billedSeconds(hold.until - now);
  }
  const ongoing = new Map<string, number>();
  for (const meeting of meetings) {
    if (!meeting.ongoing || !meeting.room || meeting.room === room || covered.has(meeting.room)) continue;
    const people = meeting.participants?.length || Math.max(1, meeting.max_participants ?? 1);
    ongoing.set(meeting.room, (ongoing.get(meeting.room) ?? 0) + people);
  }
  for (const [name, people] of ongoing) {
    const state = await getRoom(name);
    if (!state.ok) {
      if (state.missing) continue;
      return fail(copy.dailyUsageUnknown);
    }
    if (state.exp == null) return fail(copy.dailyUsageUnknown);
    if (state.exp <= now) continue;
    seconds += people * billedSeconds(state.exp - now);
  }
  return { ok: true as const, seconds };
}

function grantedExpiry(requestedExpUnix: number, now: number, roomExp: number | null, hold: Hold | undefined) {
  const roomDeadline = roomExp != null && roomExp >= now + 60 ? roomExp : null;
  if (hold && hold.until >= now + 60 && hold.until <= requestedExpUnix) return Math.min(hold.until, roomDeadline ?? hold.until);
  if (roomDeadline != null && roomDeadline <= requestedExpUnix - 60) return roomDeadline;
  return null;
}

async function planExpiry(requestedExpUnix: number, peers: number, room: string) {
  if (!hasDaily()) return fail("Daily.co is not configured.");
  const now = Math.floor(Date.now() / 1000);
  for (const [name, hold] of holds) {
    if (hold.until <= now) holds.delete(name);
  }
  const existing = await getRoom(room);
  if (!existing.ok && !existing.missing) return fail(existing.error);
  const granted = grantedExpiry(requestedExpUnix, now, existing.ok ? existing.exp : null, holds.get(room));
  if (granted) return { ok: true as const, exp: granted };
  const meetings = await listMonthMeetings(now);
  if (!meetings.ok) return meetings;
  const reserved = await reservedSeconds(now, room, meetings.data);
  if (!reserved.ok) return reserved;
  const used = meetings.data.reduce((sum, meeting) => sum + meetingSeconds(meeting, now), 0);
  const remaining = FREE_PARTICIPANT_SECONDS - used - reserved.seconds;
  const maxSeconds = Math.floor(remaining / Math.max(1, peers) / 60) * 60;
  if (maxSeconds < 60) return fail(copy.dailyLimit);
  let exp = Math.min(requestedExpUnix, now + maxSeconds);
  if (existing.ok && existing.exp != null && existing.exp >= now + 60 && existing.exp < exp) exp = existing.exp;
  if (exp < now + 60) return fail(copy.dailyLimit);
  return { ok: true as const, exp };
}

/** Issue a meeting link that cannot carry this month past the free allowance. `peers` is everyone who can be in the room at once. */
export function issueCall(room: string, userName: string, requestedExpUnix: number, peers: number) {
  return withDailyLock(async () => {
    const allowance = await planExpiry(requestedExpUnix, peers, room);
    if (!allowance.ok) return allowance;
    const ready = await ensureRoom(room, allowance.exp, "set");
    if (!ready.ok) return ready;
    const previous = holds.get(room);
    holds.set(room, { until: allowance.exp, slots: Math.max(peers, previous?.slots ?? 0) });
    return meetingToken(room, userName, allowance.exp);
  });
}

export async function meetingToken(room: string, userName: string, expUnix: number) {
  if (!hasDaily()) return fail("Daily.co is not configured.");
  const created = await dailyFetch("/meeting-tokens", {
    properties: { room_name: room, user_name: userName, exp: expUnix, enable_screenshare: true, eject_at_token_exp: true },
  });
  if (!created.ok || !created.payload.token) {
    return fail(created.payload.error || "Could not start the video session.");
  }
  return { ok: true as const, token: created.payload.token, url: `https://${process.env.DAILY_DOMAIN}/${room}?t=${created.payload.token}` };
}

export function roomNameForBooking(bookingId: string) {
  return `opp-${bookingId.replace(/-/g, "").slice(0, 8)}`;
}

export function roomNameForTest(personaId: string) {
  return `test-${personaId}`.slice(0, 40);
}
