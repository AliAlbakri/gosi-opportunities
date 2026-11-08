import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { getPayment, recordFailed, recordHeld, refundBooking } from "@/lib/domain/payments";
import { checklistDone, DAY_MS, generateSlots, HOLD_MS, isLateCancel, SESSION_MS } from "@/lib/domain/rules";
import { getSettings } from "@/lib/domain/settings";
import { ensureRoom, roomNameForBooking } from "@/lib/daily";
import { ageInRiyadh, formatWhen } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";
import type { Booking, PaymentMethod } from "@/lib/types";

function taken(error: { code?: string; message: string }) {
  return error.code === "23P01" || /no_double_booking|exclusion|overlap/i.test(error.message);
}

export async function openSlots(retireeId: string, seekerId: string | null) {
  const appNow = await getAppNow();
  const windows = await listWindows(retireeId);
  const rangeStart = new Date(appNow.getTime() + DAY_MS);
  const rangeEnd = new Date(appNow.getTime() + 30 * DAY_MS);
  const slots = generateSlots(windows, rangeStart, rangeEnd);
  const { data, error } = await admin()
    .from("bookings")
    .select("starts_at, retiree_id, seeker_id, status")
    .in("status", ["pending_payment", "confirmed"])
    .or(`retiree_id.eq.${retireeId}${seekerId ? `,seeker_id.eq.${seekerId}` : ""}`);
  if (error) throw new Error(error.message);
  const blocked = new Set(
    (data ?? [])
      .filter((row) => row.retiree_id === retireeId || row.seeker_id === seekerId)
      .map((row) => new Date(row.starts_at).toISOString()),
  );
  return slots.filter((slot) => !blocked.has(slot.toISOString()));
}

async function attachRoom(bookingId: string, endsAt: Date) {
  const name = roomNameForBooking(bookingId);
  const exp = Math.floor(endsAt.getTime() / 1000) + 3 * 60 * 60;
  const room = await ensureRoom(name, exp);
  if (room.ok) {
    await admin().from("bookings").update({ daily_room_name: name }).eq("id", bookingId);
  }
  return room;
}

async function notifyBooked(booking: Booking) {
  const when = formatWhen(booking.starts_at);
  await notifyPerson(booking.seeker_id, {
    title: `Session booked: ${when}`,
    body: "Your session is confirmed. You can join from 10 minutes before the start.",
    linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
  });
  await notifyPerson(booking.retiree_id, {
    title: `Session booked: ${when}`,
    body: "A seeker booked a session with you.",
    linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
  });
}

export async function createBooking(input: {
  personaId: string;
  seekerId: string;
  birthDate: string;
  retireeId: string;
  retireeServiceTypeId: string;
  startsAt: string;
  need: string;
  goal: string;
  terms: boolean;
}) {
  if (!input.terms) return { ok: false as const, error: "Agree to the terms to continue." };
  if (!input.need.trim() || !input.goal.trim()) return { ok: false as const, error: "Tell us what you need and what you want from the session." };
  const appNow = await getAppNow();
  if (ageInRiyadh(input.birthDate, appNow) < 18) return { ok: false as const, error: "Available for users aged 18 and over." };
  if (input.seekerId === input.retireeId) return { ok: false as const, error: "You cannot book a session with yourself." };
  const profile = await getProfile(input.retireeId);
  const windows = await listWindows(input.retireeId);
  if (!profile || profile.state !== "active" || !profile.accepting_bookings || !checklistDone(profile, windows.length)) {
    return { ok: false as const, error: "This retiree is not available for booking." };
  }
  const services = await getServiceRows(input.retireeId);
  const service = services.find((row) => row.id === input.retireeServiceTypeId && row.status === "approved");
  if (!service) return { ok: false as const, error: "Choose an approved Service Type." };
  const slots = await openSlots(input.retireeId, input.seekerId);
  const starts = new Date(input.startsAt);
  if (!slots.some((slot) => slot.toISOString() === starts.toISOString())) {
    return { ok: false as const, error: "This slot was just taken" };
  }
  const settings = await getSettings();
  const isPaid = settings.paid_enabled && service.pricing_mode === "paid";
  const ends = new Date(starts.getTime() + SESSION_MS);
  const { data, error } = await admin()
    .from("bookings")
    .insert({
      seeker_id: input.seekerId,
      retiree_id: input.retireeId,
      retiree_service_type_id: service.id,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status: isPaid ? "pending_payment" : "confirmed",
      is_paid: isPaid,
      price: isPaid ? service.price : 0,
      seeker_need: input.need.trim(),
      seeker_goal: input.goal.trim(),
      terms_accepted_at: appNow.toISOString(),
      hold_expires_at: isPaid ? new Date(appNow.getTime() + HOLD_MS).toISOString() : null,
      created_at: appNow.toISOString(),
    })
    .select("*")
    .single();
  if (error) {
    if (taken(error)) return { ok: false as const, error: "This slot was just taken" };
    return { ok: false as const, error: error.message };
  }
  if (!isPaid) {
    await attachRoom(data.id, ends);
    await notifyBooked(data as Booking);
  }
  await audit(input.personaId, isPaid ? "booking.hold" : "booking.confirmed", "booking", data.id, {});
  return { ok: true as const, booking: data as Booking, paid: isPaid };
}

export async function payBooking(bookingId: string, seekerId: string, method: PaymentMethod, success: boolean) {
  const appNow = await getAppNow();
  const { data: booking, error } = await admin().from("bookings").select("*").eq("id", bookingId).single();
  if (error) return { ok: false as const, error: error.message };
  if (booking.seeker_id !== seekerId) return { ok: false as const, error: "This booking is not yours." };
  if (booking.status !== "pending_payment") return { ok: false as const, error: "This payment is no longer open." };
  if (booking.hold_expires_at && new Date(booking.hold_expires_at) <= appNow) {
    await admin().from("bookings").update({ status: "expired" }).eq("id", bookingId).eq("status", "pending_payment");
    if (booking.is_paid && !(await getPayment(bookingId))) await recordFailed(bookingId, Number(booking.price), method);
    return { ok: false as const, error: "The hold expired. You have not been charged." };
  }
  if (!success) {
    await recordFailed(bookingId, Number(booking.price), method);
    await admin().from("bookings").update({ status: "expired" }).eq("id", bookingId).eq("status", "pending_payment");
    return { ok: false as const, error: "Payment didn't go through. You haven't been charged." };
  }
  await recordHeld(bookingId, Number(booking.price), method);
  const { data: confirmed, error: confirmError } = await admin()
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("status", "pending_payment")
    .select("*")
    .single();
  if (confirmError || !confirmed) return { ok: false as const, error: confirmError?.message ?? "Could not confirm the booking." };
  await attachRoom(confirmed.id, new Date(confirmed.ends_at));
  await notifyBooked(confirmed as Booking);
  await audit(seekerId, "payment.held", "booking", bookingId, { method });
  return { ok: true as const, booking: confirmed as Booking };
}

export async function expireHold(bookingId: string) {
  await admin().from("bookings").update({ status: "expired" }).eq("id", bookingId).eq("status", "pending_payment");
}

export async function cancelBooking(input: { bookingId: string; personId: string; personaId: string; party: "seeker" | "retiree" }) {
  const appNow = await getAppNow();
  const { data: booking, error } = await admin().from("bookings").select("*").eq("id", input.bookingId).single();
  if (error) return { ok: false as const, error: error.message };
  if (input.party === "seeker" && booking.seeker_id !== input.personId) return { ok: false as const, error: "This booking is not yours." };
  if (input.party === "retiree" && booking.retiree_id !== input.personId) return { ok: false as const, error: "This booking is not yours." };
  if (booking.status !== "confirmed" && booking.status !== "pending_payment") {
    return { ok: false as const, error: "This session can no longer be cancelled." };
  }
  if (new Date(booking.starts_at) <= appNow) return { ok: false as const, error: "This session has already started." };
  const late = booking.status === "confirmed" && isLateCancel(appNow, new Date(booking.starts_at));
  const { error: updateError } = await admin()
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_by: input.party,
      cancelled_at: appNow.toISOString(),
      late_cancel: late,
    })
    .eq("id", booking.id)
    .in("status", ["confirmed", "pending_payment"]);
  if (updateError) return { ok: false as const, error: updateError.message };
  if (booking.is_paid) await refundBooking(booking.id, `Cancelled by ${input.party}`);
  const when = formatWhen(booking.starts_at);
  if (input.party === "retiree") {
    await notifyPerson(booking.seeker_id, {
      title: "Session cancelled",
      body: `Your session on ${when} was cancelled. Book another slot whenever you are ready.`,
      linkFor: (id) => `/phone/${id}/opportunities`,
    });
  } else {
    await notifyPerson(booking.retiree_id, {
      title: "Session cancelled",
      body: `The seeker cancelled the session on ${when}.`,
      linkFor: (id) => `/phone/${id}/opportunities/retiree/sessions`,
    });
  }
  await audit(input.personaId, "booking.cancelled", "booking", booking.id, { party: input.party, late });
  return { ok: true as const };
}

export async function cancelFutureForRetiree(
  retireeId: string,
  actor: string,
  by: "gosi" | "system",
  reason: string,
  options?: { paidOnly?: boolean; title?: string; body?: string },
) {
  const appNow = await getAppNow();
  let query = admin()
    .from("bookings")
    .select("*")
    .eq("retiree_id", retireeId)
    .in("status", ["confirmed", "pending_payment"])
    .gt("starts_at", appNow.toISOString());
  if (options?.paidOnly) query = query.eq("is_paid", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let cancelled = 0;
  for (const booking of data ?? []) {
    const { data: updated } = await admin()
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_by: by,
        cancelled_at: appNow.toISOString(),
        late_cancel: false,
      })
      .eq("id", booking.id)
      .in("status", ["confirmed", "pending_payment"])
      .select("id")
      .maybeSingle();
    if (!updated) continue;
    cancelled += 1;
    if (booking.is_paid) await refundBooking(booking.id, reason);
    await notifyPerson(booking.seeker_id, {
      title: options?.title ?? "Your session was cancelled. Book another",
      body: options?.body ?? "The session will not go ahead. You can choose another retiree and time.",
      linkFor: (id) => `/phone/${id}/opportunities`,
    });
    if (options?.paidOnly) {
      await notifyPerson(booking.retiree_id, {
        title: "Paid session cancelled and refunded",
        body: "Paid sessions are switched off. This upcoming paid booking was cancelled.",
        linkFor: (id) => `/phone/${id}/opportunities/retiree/sessions`,
      });
    }
    await audit(actor, "booking.cancelled", "booking", booking.id, { by, reason });
  }
  return cancelled;
}

export async function getBooking(id: string) {
  const { data, error } = await admin().from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Booking | null;
}

export async function bookingsForPerson(personId: string) {
  const { data, error } = await admin()
    .from("bookings")
    .select("*")
    .or(`seeker_id.eq.${personId},retiree_id.eq.${personId}`)
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}
