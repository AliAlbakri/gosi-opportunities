import { getBooking } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { issueCall, roomNameForBooking, roomNameForTest } from "@/lib/daily";
import { admin, broadcast } from "@/lib/supabase/admin";
import { getSessionPhase, type SessionEvent, joinOpensLabel } from "@/lib/domain/sessionPhase";

export async function joinSession(bookingId: string, personId: string, displayName: string) {
  const booking = await getBooking(bookingId);
  if (!booking) return { ok: false as const, code: "NOT_FOUND" as const, error: "Session not found." };
  if (booking.seeker_id !== personId && booking.retiree_id !== personId) {
    return { ok: false as const, code: "NOT_PARTICIPANT" as const, error: "This session is not yours." };
  }
  const appNow = await getAppNow();
  const phase = getSessionPhase(
    { status: booking.status, startsAt: booking.starts_at, endsAt: booking.ends_at, seekerId: booking.seeker_id, retireeId: booking.retiree_id, youId: personId },
    [],
    appNow,
  );
  if (phase.join !== "now" && phase.join !== "rejoin") {
    return { ok: false as const, code: "NOT_OPEN_YET" as const, error: `${joinOpensLabel(phase.opensAt)}.`, opensAt: phase.opensAt.toISOString() };
  }
  const name = booking.daily_room_name || roomNameForBooking(booking.id);
  const token = await issueCall(name, displayName, Math.floor(Date.now() / 1000) + 3 * 60 * 60, 2);
  if (!token.ok) return { ok: false as const, code: "ROOM_ERROR" as const, error: token.error || "The video room could not be opened. Try again." };
  if (!booking.daily_room_name || booking.daily_room_name !== name) {
    await admin().from("bookings").update({ daily_room_name: name }).eq("id", booking.id);
  }
  const { data: next } = await admin()
    .from("bookings")
    .select("id")
    .eq("retiree_id", booking.retiree_id)
    .eq("status", "confirmed")
    .eq("starts_at", booking.ends_at)
    .maybeSingle();
  return {
    ok: true as const,
    roomUrl: token.url,
    token: token.token,
    url: token.url,
    endsAt: booking.ends_at,
    startsAt: booking.starts_at,
    hasNext: Boolean(next) && personId === booking.retiree_id,
  };
}

export async function logSessionEvent(bookingId: string, personId: string, event: "joined" | "left") {
  const booking = await getBooking(bookingId);
  if (!booking) return { ok: false as const, error: "Session not found." };
  if (booking.seeker_id !== personId && booking.retiree_id !== personId) return { ok: false as const, error: "Not a participant." };
  const appNow = await getAppNow();
  const { error } = await admin().from("session_events").insert({
    booking_id: bookingId,
    person_id: personId,
    event,
    at: appNow.toISOString(),
  });
  if (error) return { ok: false as const, error: error.message };
  const otherId = personId === booking.seeker_id ? booking.retiree_id : booking.seeker_id;
  const { data: personas } = await admin().from("personas").select("id, person_id").in("person_id", [booking.seeker_id, booking.retiree_id]);
  for (const persona of personas ?? []) {
    await broadcast(`persona:${persona.id}`, "presence", { bookingId, personId, event });
  }
  if (event === "joined") await notifyWaiting(booking, personId, otherId);
  return { ok: true as const };
}

async function notifyWaiting(booking: { id: string; seeker_id: string; retiree_id: string; reminders_sent: string[] | null }, personId: string, otherId: string) {
  const key = `wait:${otherId}`;
  const sent = new Set(booking.reminders_sent ?? []);
  if (sent.has(key)) return;
  const { data: events } = await admin().from("session_events").select("person_id, event").eq("booking_id", booking.id).eq("event", "joined");
  if ((events ?? []).some((row) => row.person_id === otherId)) return;
  const { data: people } = await admin().from("gosi_people").select("id, first_name").in("id", [personId]);
  const name = people?.[0]?.first_name ?? "They";
  await notifyPerson(otherId, {
    title: `${name} is waiting for you`,
    body: "Join the session now.",
    linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}/lobby`,
  });
  await admin().from("bookings").update({ reminders_sent: [...sent, key] }).eq("id", booking.id);
}

export async function eventsForBooking(bookingId: string): Promise<SessionEvent[]> {
  const { data, error } = await admin().from("session_events").select("person_id, event, at").eq("booking_id", bookingId).order("at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ personId: row.person_id as string, event: row.event as "joined" | "left", at: row.at as string }));
}

export function phaseFor(
  booking: { status: string; starts_at: string; ends_at: string; seeker_id: string; retiree_id: string },
  events: SessionEvent[],
  youId: string,
  appNow: Date,
) {
  return getSessionPhase(
    { status: booking.status, startsAt: booking.starts_at, endsAt: booking.ends_at, seekerId: booking.seeker_id, retireeId: booking.retiree_id, youId },
    events,
    appNow,
  );
}

export async function testCall(personaId: string, displayName: string) {
  const name = roomNameForTest(personaId);
  return issueCall(name, displayName, Math.floor(Date.now() / 1000) + 2 * 60 * 60, 1);
}
