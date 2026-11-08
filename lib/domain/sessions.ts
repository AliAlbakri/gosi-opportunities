import { getBooking } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { ensureRoom, meetingToken, roomNameForBooking, roomNameForTest } from "@/lib/daily";
import { admin } from "@/lib/supabase/admin";

export async function joinSession(bookingId: string, personId: string, displayName: string) {
  const booking = await getBooking(bookingId);
  if (!booking) return { ok: false as const, error: "Session not found." };
  if (booking.seeker_id !== personId && booking.retiree_id !== personId) {
    return { ok: false as const, error: "This session is not yours." };
  }
  if (booking.status !== "confirmed") return { ok: false as const, error: "This session is not ready to join." };
  const appNow = await getAppNow();
  const start = new Date(booking.starts_at).getTime();
  const end = new Date(booking.ends_at).getTime();
  if (appNow.getTime() < start - 10 * 60 * 1000) return { ok: false as const, error: "You can join from 10 minutes before the start." };
  if (appNow.getTime() > end + 30 * 60 * 1000) return { ok: false as const, error: "The join window for this session has closed." };
  const name = booking.daily_room_name || roomNameForBooking(booking.id);
  const exp = Math.floor(end / 1000) + 3 * 60 * 60;
  const room = await ensureRoom(name, exp);
  if (!room.ok) return room;
  if (!booking.daily_room_name) {
    await admin().from("bookings").update({ daily_room_name: name }).eq("id", booking.id);
  }
  const token = await meetingToken(name, displayName, exp);
  if (!token.ok) return token;
  const { data: next } = await admin()
    .from("bookings")
    .select("id")
    .eq("retiree_id", booking.retiree_id)
    .eq("status", "confirmed")
    .eq("starts_at", booking.ends_at)
    .maybeSingle();
  return { ok: true as const, url: token.url, endsAt: booking.ends_at, startsAt: booking.starts_at, hasNext: Boolean(next) && personId === booking.retiree_id };
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
  return { ok: true as const };
}

export async function testCall(personaId: string, displayName: string) {
  const name = roomNameForTest(personaId);
  const exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const room = await ensureRoom(name, exp);
  if (!room.ok) return room;
  return meetingToken(name, displayName, exp);
}
