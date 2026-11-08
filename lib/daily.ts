const BASE = "https://api.daily.co/v1";

export function hasDaily() {
  return Boolean(process.env.DAILY_API_KEY && process.env.DAILY_DOMAIN);
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
  return { ok: response.ok, status: response.status, payload };
}

export async function ensureRoom(name: string, expUnix: number) {
  if (!hasDaily()) return { ok: false as const, error: "Daily.co is not configured." };
  const created = await dailyFetch("/rooms", {
    name,
    privacy: "private",
    properties: {
      exp: expUnix,
      enable_screenshare: true,
      enable_chat: false,
      enable_recording: false,
    },
  });
  if (!created.ok && created.status !== 400) {
    return { ok: false as const, error: created.payload.error || created.payload.info || "Could not create the video room." };
  }
  return { ok: true as const, name };
}

export async function meetingToken(room: string, userName: string, expUnix: number) {
  if (!hasDaily()) return { ok: false as const, error: "Daily.co is not configured." };
  const created = await dailyFetch("/meeting-tokens", {
    properties: { room_name: room, user_name: userName, exp: expUnix, enable_screenshare: true },
  });
  if (!created.ok || !created.payload.token) {
    return { ok: false as const, error: created.payload.error || "Could not start the video session." };
  }
  return { ok: true as const, token: created.payload.token, url: `https://${process.env.DAILY_DOMAIN}/${room}?t=${created.payload.token}` };
}

export function roomNameForBooking(bookingId: string) {
  return `opp-${bookingId.replace(/-/g, "").slice(0, 8)}`;
}

export function roomNameForTest(personaId: string) {
  return `test-${personaId}`.slice(0, 40);
}
