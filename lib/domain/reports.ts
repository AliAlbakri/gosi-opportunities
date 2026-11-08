import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson, notifyOperators } from "@/lib/domain/notifications";
import { releasePayment } from "@/lib/domain/payments";
import { refundBooking } from "@/lib/domain/payments";
import { addWorkingDays, RELEASE_MS } from "@/lib/domain/rules";
import { admin } from "@/lib/supabase/admin";
import { REPORT_REASONS } from "@/lib/types";

export async function fileReport(input: {
  bookingId: string;
  reporterId: string;
  reason: string;
  description: string;
}) {
  if (!input.description.trim()) return { ok: false as const, error: "Describe what happened." };
  if (!REPORT_REASONS.includes(input.reason as (typeof REPORT_REASONS)[number])) {
    return { ok: false as const, error: "Choose a reason." };
  }
  const { data: booking, error } = await admin().from("bookings").select("*").eq("id", input.bookingId).single();
  if (error) return { ok: false as const, error: error.message };
  if (booking.seeker_id !== input.reporterId) return { ok: false as const, error: "This session is not yours." };
  const appNow = await getAppNow();
  const completedAt = booking.completed_at ? new Date(booking.completed_at) : null;
  const within48 = completedAt != null && appNow.getTime() - completedAt.getTime() <= RELEASE_MS;
  const kind = booking.is_paid && booking.status === "completed" && within48 ? "dispute" : "complaint";
  if (kind === "dispute") {
    const { data: existing } = await admin()
      .from("reports")
      .select("id")
      .eq("booking_id", input.bookingId)
      .eq("kind", "dispute")
      .maybeSingle();
    if (existing) return { ok: false as const, error: "A dispute is already open for this session." };
  }
  const due = kind === "dispute" ? addWorkingDays(appNow, 10) : null;
  const { data: report, error: insertError } = await admin()
    .from("reports")
    .insert({
      booking_id: input.bookingId,
      reporter_id: input.reporterId,
      kind,
      reason: input.reason,
      description: input.description.trim(),
      status: "open",
      due_by: due?.toISOString() ?? null,
      created_at: appNow.toISOString(),
    })
    .select("*")
    .single();
  if (insertError) return { ok: false as const, error: insertError.message };
  if (kind === "dispute") {
    await notifyPerson(booking.retiree_id, {
      title: "A payment is under review",
      body: "A seeker opened a dispute. The payment stays held until GOSI decides.",
      linkFor: (id) => `/phone/${id}/opportunities/retiree/earnings`,
    });
    await notifyOperators({
      title: "New dispute",
      body: "A paid session has a dispute to review.",
      linkFor: (operatorId) => `/ops/${operatorId}/reports/${report.id}`,
    });
  }
  return { ok: true as const, kind };
}

export async function listReports(kind?: "complaint" | "dispute") {
  let query = admin().from("reports").select("*").order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getReport(id: string) {
  const { data, error } = await admin().from("reports").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function decideDispute(input: { operatorId: string; reportId: string; uphold: boolean; note: string }) {
  if (!input.note.trim()) return { ok: false as const, error: "Add a decision note." };
  const report = await getReport(input.reportId);
  if (!report || report.kind !== "dispute" || report.status !== "open") {
    return { ok: false as const, error: "This dispute is already decided." };
  }
  const appNow = await getAppNow();
  const { data: booking } = await admin().from("bookings").select("*").eq("id", report.booking_id).single();
  if (!booking) return { ok: false as const, error: "Booking not found." };
  if (input.uphold) {
    await refundBooking(booking.id, "Dispute upheld");
    await admin()
      .from("reports")
      .update({ status: "refunded", upheld: true, decided_by: input.operatorId, decided_at: appNow.toISOString(), decision_note: input.note })
      .eq("id", report.id)
      .eq("status", "open");
  } else {
    await admin()
      .from("reports")
      .update({ status: "rejected", upheld: false, decided_by: input.operatorId, decided_at: appNow.toISOString(), decision_note: input.note })
      .eq("id", report.id)
      .eq("status", "open");
    const completedAt = booking.completed_at ? new Date(booking.completed_at) : null;
    if (completedAt && appNow.getTime() >= completedAt.getTime() + RELEASE_MS) {
      const { data: payment } = await admin().from("payments").select("id, status").eq("booking_id", booking.id).maybeSingle();
      if (payment?.status === "held") await releasePayment(payment.id);
    }
  }
  await notifyPerson(booking.seeker_id, {
    title: "Your report has been reviewed",
    body: input.uphold ? "The payment will be refunded in full." : "The dispute was not upheld. The session payment follows the usual release.",
    linkFor: (id) => `/phone/${id}/opportunities/bookings/${booking.id}`,
  });
  await notifyPerson(booking.retiree_id, {
    title: "Your report has been reviewed",
    body: input.uphold ? "The dispute was upheld and the seeker will be refunded." : "The dispute was not upheld.",
    linkFor: (id) => `/phone/${id}/opportunities/retiree/earnings`,
  });
  await audit(input.operatorId, input.uphold ? "dispute.refunded" : "dispute.rejected", "report", report.id, {});
  return { ok: true as const };
}

export async function closeComplaint(operatorId: string, reportId: string, note: string) {
  if (!note.trim()) return { ok: false as const, error: "Add a note." };
  const appNow = await getAppNow();
  const { error } = await admin()
    .from("reports")
    .update({ status: "closed", decided_by: operatorId, decided_at: appNow.toISOString(), decision_note: note })
    .eq("id", reportId)
    .eq("kind", "complaint")
    .eq("status", "open");
  if (error) return { ok: false as const, error: error.message };
  await audit(operatorId, "complaint.closed", "report", reportId, {});
  return { ok: true as const };
}

export async function evidence(bookingId: string) {
  const [{ data: booking }, { data: events }, { data: feedback }, { data: payment }] = await Promise.all([
    admin().from("bookings").select("*").eq("id", bookingId).maybeSingle(),
    admin().from("session_events").select("*").eq("booking_id", bookingId).order("at"),
    admin().from("feedback").select("*").eq("booking_id", bookingId).maybeSingle(),
    admin().from("payments").select("*").eq("booking_id", bookingId).maybeSingle(),
  ]);
  return { booking, events: events ?? [], feedback, payment };
}
