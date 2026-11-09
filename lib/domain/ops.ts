import { audit } from "@/lib/domain/audit";
import { cancelFutureForRetiree } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { getSettings } from "@/lib/domain/settings";
import { NOTE_TEMPLATES } from "@/lib/types";
import { admin } from "@/lib/supabase/admin";

export async function pauseRetiree(operatorId: string, personId: string, reason: string) {
  if (!reason.trim()) return { ok: false as const, error: "A reason is required." };
  const { data: profile } = await admin().from("retiree_profiles").select("state").eq("person_id", personId).maybeSingle();
  if (!profile) return { ok: false as const, error: "Profile not found." };
  if (profile.state === "paused") return { ok: true as const };
  const appNow = await getAppNow();
  const { data: updated, error } = await admin()
    .from("retiree_profiles")
    .update({ state: "paused", paused_at: appNow.toISOString(), paused_reason: reason.trim() })
    .eq("person_id", personId)
    .neq("state", "paused")
    .select("person_id")
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!updated) return { ok: true as const };
  await cancelFutureForRetiree(personId, operatorId, "gosi", reason.trim());
  await notifyPerson(personId, {
    title: "Your profile has been paused",
    body: "Your GOSI Opportunities profile is paused. You can still use the rest of the GOSI app.",
    linkFor: (id) => `/phone/${id}/opportunities/retiree`,
  });
  await audit(operatorId, "retiree.paused", "retiree_profile", personId, { reason: reason.trim() });
  return { ok: true as const };
}

export async function restoreRetiree(operatorId: string, personId: string) {
  const { data: updated, error } = await admin()
    .from("retiree_profiles")
    .update({ state: "active", paused_at: null, paused_reason: null })
    .eq("person_id", personId)
    .eq("state", "paused")
    .select("person_id")
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!updated) return { ok: true as const };
  await notifyPerson(personId, {
    title: "Your profile is active again",
    body: "Seekers can book you when your go-live checklist is complete and you are accepting bookings.",
    linkFor: (id) => `/phone/${id}/opportunities/retiree`,
  });
  await audit(operatorId, "retiree.restored", "retiree_profile", personId, {});
  return { ok: true as const };
}

export async function sendNote(operatorId: string, personId: string, templateId: string, body: string) {
  if (!NOTE_TEMPLATES[templateId]) return { ok: false as const, error: "Choose a template." };
  if (!body.trim()) return { ok: false as const, error: "Write a note." };
  const appNow = await getAppNow();
  const { error } = await admin().from("ops_notes").insert({
    retiree_id: personId,
    template_id: templateId,
    body: body.trim(),
    sent_by: operatorId,
    sent_at: appNow.toISOString(),
  });
  if (error) return { ok: false as const, error: error.message };
  await notifyPerson(personId, {
    title: "A note from GOSI",
    body: body.trim(),
    linkFor: (id) => `/phone/${id}/opportunities/retiree/notes`,
  });
  await audit(operatorId, "note.sent", "retiree_profile", personId, { templateId });
  return { ok: true as const };
}

export async function notesFor(personId: string) {
  const { data, error } = await admin().from("ops_notes").select("*").eq("retiree_id", personId).order("sent_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function overview() {
  const appNow = await getAppNow();
  const [invited, profiles, bookings, disputes] = await Promise.all([
    admin().from("invitations").select("id", { count: "exact", head: true }),
    admin().from("retiree_profiles").select("state"),
    admin().from("bookings").select("id, status, starts_at").eq("status", "confirmed").gt("starts_at", appNow.toISOString()),
    admin().from("reports").select("id, due_by, status").eq("kind", "dispute").eq("status", "open"),
  ]);
  const states = profiles.data ?? [];
  const open = disputes.data ?? [];
  return {
    invited: invited.count ?? 0,
    drafts: states.filter((row) => row.state === "draft").length,
    pending: states.filter((row) => row.state === "pending_review").length,
    active: states.filter((row) => row.state === "active").length,
    paused: states.filter((row) => row.state === "paused").length,
    upcoming: (bookings.data ?? []).length,
    disputes: open.length,
    overdue: open.filter((row) => row.due_by && new Date(row.due_by) < appNow).length,
  };
}

export async function auditLog() {
  const { data, error } = await admin().from("audit_log").select("*").order("at", { ascending: false }).limit(300);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function monitoringList() {
  const settings = await getSettings();
  const [{ data: profiles }, { data: people }, { data: services }, { data: types }, { data: bookings }, { data: feedback }, { data: reports }, { data: payments }] =
    await Promise.all([
      admin().from("retiree_profiles").select("*"),
      admin().from("gosi_people").select("id, full_name, mobile"),
      admin().from("retiree_service_types").select("*").eq("status", "approved"),
      admin().from("service_types").select("id, name"),
      admin().from("bookings").select("id, retiree_id, status, cancelled_by, late_cancel, completed_at, starts_at, is_paid"),
      admin().from("feedback").select("booking_id, rating"),
      admin().from("reports").select("booking_id, kind, status, upheld"),
      admin().from("payments").select("booking_id, status, amount"),
    ]);
  const names = new Map((people ?? []).map((row) => [row.id, row]));
  const typeName = new Map((types ?? []).map((row) => [row.id, row.name]));
  const ratingOf = new Map((feedback ?? []).map((row) => [row.booking_id, row.rating as number]));
  return (profiles ?? [])
    .filter((profile) => profile.state === "active" || profile.state === "paused")
    .map((profile) => {
      const mine = (bookings ?? []).filter((row) => row.retiree_id === profile.person_id);
      const delivered = mine.filter((row) => row.status === "completed");
      const ratings = delivered.map((row) => ratingOf.get(row.id)).filter((n): n is number => typeof n === "number");
      const bookingIds = new Set(mine.map((row) => row.id));
      const relatedReports = (reports ?? []).filter((row) => bookingIds.has(row.booking_id));
      const complaints = relatedReports.filter((row) => row.kind === "complaint" || row.upheld).length;
      const openDisputes = relatedReports.filter((row) => row.kind === "dispute" && row.status === "open").length;
      const pay = (payments ?? []).filter((row) => mine.some((booking) => booking.id === row.booking_id));
      const sum = (status: string) => pay.filter((row) => row.status === status).reduce((total, row) => total + Number(row.amount), 0);
      const last = delivered
        .map((row) => row.completed_at)
        .filter(Boolean)
        .sort()
        .at(-1);
      return {
        personId: profile.person_id,
        name: names.get(profile.person_id)?.full_name ?? "Retiree",
        mobile: names.get(profile.person_id)?.mobile ?? "",
        status: profile.state === "paused" ? "Paused" : "Active",
        services: (services ?? [])
          .filter((row) => row.person_id === profile.person_id)
          .map((row) => typeName.get(row.service_type_id) ?? row.service_type_id),
        approvedAt: profile.first_approved_at,
        delivered: delivered.length,
        rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        missed: mine.filter((row) => row.status === "no_show_retiree").length,
        late: mine.filter((row) => row.late_cancel && row.cancelled_by === "retiree").length,
        complaints,
        lastSession: last ?? null,
        disputes: openDisputes,
        held: sum("held"),
        released: sum("released"),
        paidOut: sum("paid_out"),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({ ...row, paidEnabled: settings.paid_enabled }));
}
