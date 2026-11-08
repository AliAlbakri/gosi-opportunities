import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { getPayment, recordFailed, releasePayment, refundBooking, setReleaseDue } from "@/lib/domain/payments";
import { settlementMonthDue } from "@/lib/domain/rules";
import { getSettings } from "@/lib/domain/settings";
import { runSettlement } from "@/lib/domain/settlement";
import { formatWhen } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

let lastLazy = 0;

export async function processDueLazy() {
  if (Date.now() - lastLazy < 15_000) return;
  lastLazy = Date.now();
  await processDue();
}

export async function processDue() {
  const appNow = await getAppNow();
  await expireHolds(appNow);
  await sendReminders(appNow);
  await markNoShows(appNow);
  await completeSessions(appNow);
  await completeStragglers(appNow);
  await releaseHeld(appNow);
  await settleIfDue(appNow);
}

async function expireHolds(appNow: Date) {
  const { data, error } = await admin().from("bookings").select("*").eq("status", "pending_payment");
  if (error) throw new Error(error.message);
  for (const booking of data ?? []) {
    if (!booking.hold_expires_at || new Date(booking.hold_expires_at) > appNow) continue;
    const { data: updated } = await admin().from("bookings").update({ status: "expired" }).eq("id", booking.id).eq("status", "pending_payment").select("id").maybeSingle();
    if (!updated || !booking.is_paid) continue;
    const existing = await getPayment(booking.id);
    if (!existing) await recordFailed(booking.id, Number(booking.price), "card");
  }
}

async function sendReminders(appNow: Date) {
  const { data, error } = await admin().from("bookings").select("*").eq("status", "confirmed");
  if (error) throw new Error(error.message);
  for (const booking of data ?? []) {
    const start = new Date(booking.starts_at).getTime();
    if (appNow.getTime() >= start) continue;
    const sent = new Set<string>(booking.reminders_sent ?? []);
    const due: string[] = [];
    if (appNow.getTime() >= start - 24 * 60 * 60 * 1000 && !sent.has("24h")) due.push("24h");
    if (appNow.getTime() >= start - 60 * 60 * 1000 && !sent.has("1h")) due.push("1h");
    if (!due.length) continue;
    const when = formatWhen(booking.starts_at);
    for (const kind of due) {
      const title = kind === "24h" ? "Your session starts in 24 hours" : "Your session starts in 1 hour";
      const body = `Session at ${when}. You can join from 10 minutes before the start.`;
      await notifyPerson(booking.seeker_id, {
        title,
        body,
        linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
      });
      await notifyPerson(booking.retiree_id, {
        title,
        body,
        linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
      });
    }
    await admin()
      .from("bookings")
      .update({ reminders_sent: [...sent, ...due] })
      .eq("id", booking.id);
  }
}

async function eventsFor(bookingIds: string[]) {
  if (!bookingIds.length) return [];
  const { data, error } = await admin().from("session_events").select("*").in("booking_id", bookingIds);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function markNoShows(appNow: Date) {
  const { data, error } = await admin().from("bookings").select("*").eq("status", "confirmed");
  if (error) throw new Error(error.message);
  const due = (data ?? []).filter((booking) => appNow.getTime() >= new Date(booking.starts_at).getTime() + 15 * 60 * 1000);
  const events = await eventsFor(due.map((booking) => booking.id));
  for (const booking of due) {
    const rows = events.filter((event) => event.booking_id === booking.id && event.event === "joined");
    const retireeJoined = rows.some((event) => event.person_id === booking.retiree_id);
    const seekerJoined = rows.some((event) => event.person_id === booking.seeker_id);
    if (retireeJoined && seekerJoined) continue;
    const status = retireeJoined ? "no_show_seeker" : "no_show_retiree";
    const { data: updated } = await admin()
      .from("bookings")
      .update({ status })
      .eq("id", booking.id)
      .eq("status", "confirmed")
      .select("id")
      .maybeSingle();
    if (!updated) continue;
    if (booking.is_paid) await refundBooking(booking.id, status);
    const body = retireeJoined
      ? "The seeker did not join within 15 minutes. The session is marked as missed."
      : "The retiree did not join within 15 minutes. The session is marked as missed.";
    await notifyPerson(booking.seeker_id, {
      title: "Session marked as missed",
      body,
      linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
    });
    await notifyPerson(booking.retiree_id, {
      title: "Session marked as missed",
      body,
      linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
    });
  }
}

async function finish(booking: { id: string; seeker_id: string; is_paid: boolean }, completedAt: Date) {
  const { data: updated } = await admin()
    .from("bookings")
    .update({ status: "completed", completed_at: completedAt.toISOString() })
    .eq("id", booking.id)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();
  if (!updated) return;
  if (booking.is_paid) await setReleaseDue(booking.id, completedAt);
  await notifyPerson(booking.seeker_id, {
    title: "How was your session?",
    body: "A short rating helps other seekers and stays anonymous to the retiree.",
    linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}/feedback`,
  });
}

async function completeSessions(appNow: Date) {
  const { data, error } = await admin().from("bookings").select("*").eq("status", "confirmed");
  if (error) throw new Error(error.message);
  const due = (data ?? []).filter((booking) => new Date(booking.ends_at) <= appNow);
  const events = await eventsFor(due.map((booking) => booking.id));
  for (const booking of due) {
    const left = events.filter((event) => event.booking_id === booking.id && event.event === "left");
    const seekerLeft = left.filter((event) => event.person_id === booking.seeker_id);
    const retireeLeft = left.filter((event) => event.person_id === booking.retiree_id);
    if (!seekerLeft.length || !retireeLeft.length) continue;
    const last = [...seekerLeft, ...retireeLeft].map((event) => new Date(event.at).getTime()).sort((a, b) => b - a)[0];
    await finish(booking, new Date(last));
  }
}

async function completeStragglers(appNow: Date) {
  const { data, error } = await admin().from("bookings").select("*").eq("status", "confirmed");
  if (error) throw new Error(error.message);
  const due = (data ?? []).filter((booking) => appNow.getTime() >= new Date(booking.ends_at).getTime() + 3 * 60 * 60 * 1000);
  const events = await eventsFor(due.map((booking) => booking.id));
  for (const booking of due) {
    const rows = events.filter((event) => event.booking_id === booking.id);
    const joined = new Set(rows.filter((event) => event.event === "joined").map((event) => event.person_id));
    const left = new Set(rows.filter((event) => event.event === "left").map((event) => event.person_id));
    if (!joined.has(booking.seeker_id) || !joined.has(booking.retiree_id)) continue;
    if (left.has(booking.seeker_id) && left.has(booking.retiree_id)) continue;
    await finish(booking, new Date(booking.ends_at));
  }
}

async function releaseHeld(appNow: Date) {
  const { data: payments, error } = await admin().from("payments").select("*").eq("status", "held").not("release_due_at", "is", null);
  if (error) throw new Error(error.message);
  const { data: disputes } = await admin().from("reports").select("booking_id").eq("kind", "dispute").eq("status", "open");
  const frozen = new Set((disputes ?? []).map((row) => row.booking_id));
  for (const payment of payments ?? []) {
    if (!payment.release_due_at || new Date(payment.release_due_at) > appNow) continue;
    if (frozen.has(payment.booking_id)) continue;
    await releasePayment(payment.id);
  }
}

async function settleIfDue(appNow: Date) {
  const settings = await getSettings();
  const period = settlementMonthDue(appNow, settings.last_settlement_period);
  if (!period) return;
  await runSettlement(period, "system");
}
