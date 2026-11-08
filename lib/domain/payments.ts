import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { admin } from "@/lib/supabase/admin";
import { money } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

export function pspRef() {
  return `PSP-OPP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function getPayment(bookingId: string) {
  const { data, error } = await admin().from("payments").select("*").eq("booking_id", bookingId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function refundBooking(bookingId: string, reason: string) {
  const appNow = await getAppNow();
  const payment = await getPayment(bookingId);
  if (!payment || payment.status !== "held") return false;
  const { data, error } = await admin()
    .from("payments")
    .update({ status: "refunded", refunded_at: appNow.toISOString(), refund_reason: reason })
    .eq("id", payment.id)
    .eq("status", "held")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return false;
  const { data: booking } = await admin().from("bookings").select("seeker_id").eq("id", bookingId).single();
  if (booking) {
    await notifyPerson(booking.seeker_id, {
      title: `Refund of ${money(data.amount)} is on its way`,
      body: "You have not been charged for a session that did not go ahead.",
      linkFor: (id) => `/phone/${id}/opportunities/bookings/${bookingId}`,
    });
  }
  return true;
}

export async function recordFailed(bookingId: string, amount: number, method: PaymentMethod) {
  const appNow = await getAppNow();
  await admin().from("payments").insert({
    booking_id: bookingId,
    amount,
    method,
    psp_ref: pspRef(),
    status: "failed",
    created_at: appNow.toISOString(),
  });
}

export async function recordHeld(bookingId: string, amount: number, method: PaymentMethod) {
  const appNow = await getAppNow();
  const { data, error } = await admin()
    .from("payments")
    .insert({
      booking_id: bookingId,
      amount,
      method,
      psp_ref: pspRef(),
      status: "held",
      held_at: appNow.toISOString(),
      created_at: appNow.toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const { data: booking } = await admin().from("bookings").select("seeker_id").eq("id", bookingId).single();
  if (booking) {
    await notifyPerson(booking.seeker_id, {
      title: `Payment received: ${money(amount)}`,
      body: "Your payment is held until the session is complete.",
      linkFor: (id) => `/phone/${id}/opportunities/bookings/${bookingId}`,
    });
  }
  return data;
}

export async function setReleaseDue(bookingId: string, completedAt: Date) {
  const due = new Date(completedAt.getTime() + 48 * 60 * 60 * 1000);
  await admin()
    .from("payments")
    .update({ release_due_at: due.toISOString() })
    .eq("booking_id", bookingId)
    .eq("status", "held");
}

export async function releasePayment(paymentId: string) {
  const appNow = await getAppNow();
  const { data, error } = await admin()
    .from("payments")
    .update({ status: "released", released_at: appNow.toISOString() })
    .eq("id", paymentId)
    .eq("status", "held")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
