import { getProfile, getServiceRows, operatorDocuments } from "@/lib/domain/applications";
import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { employmentFor, getPerson } from "@/lib/domain/personas";
import { deriveProfileState } from "@/lib/domain/rules";
import { getServiceTypes } from "@/lib/domain/settings";
import { admin } from "@/lib/supabase/admin";
import { REASON_CODES, type RstStatus } from "@/lib/types";

export async function reviewQueue() {
  const { data: pending, error } = await admin()
    .from("retiree_service_types")
    .select("person_id")
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  const ids = [...new Set((pending ?? []).map((row) => row.person_id))];
  if (!ids.length) return [];
  const { data: profiles, error: profileError } = await admin()
    .from("retiree_profiles")
    .select("*")
    .in("person_id", ids)
    .order("submitted_at", { ascending: true });
  if (profileError) throw new Error(profileError.message);
  const { data: people, error: peopleError } = await admin().from("gosi_people").select("id, full_name, mobile").in("id", ids);
  if (peopleError) throw new Error(peopleError.message);
  const names = new Map((people ?? []).map((row) => [row.id, row]));
  return (profiles ?? []).map((profile) => ({
    ...profile,
    full_name: names.get(profile.person_id)?.full_name ?? "Retiree",
    mobile: names.get(profile.person_id)?.mobile ?? "",
  }));
}

export async function reviewDetail(personId: string) {
  const [person, jobs, profile, services, documents, serviceTypes] = await Promise.all([
    getPerson(personId),
    employmentFor(personId),
    getProfile(personId),
    getServiceRows(personId),
    operatorDocuments(personId),
    getServiceTypes(),
  ]);
  const types = new Map(serviceTypes.map((row) => [row.id, row]));
  return {
    person,
    jobs,
    profile,
    documents,
    services: services.map((row) => ({ ...row, serviceType: types.get(row.service_type_id) })),
  };
}

export async function decideServiceType(input: {
  operatorId: string;
  rstId: string;
  decision: "approved" | "not_approved";
  reasonCode?: keyof typeof REASON_CODES;
  reasonNote?: string;
}) {
  if (input.decision === "not_approved" && !input.reasonCode) {
    return { ok: false as const, error: "Choose a reason." };
  }
  const { data: row, error } = await admin().from("retiree_service_types").select("*").eq("id", input.rstId).single();
  if (error) return { ok: false as const, error: error.message };
  const appNow = await getAppNow();
  const { error: updateError } = await admin()
    .from("retiree_service_types")
    .update({
      status: input.decision,
      reason_code: input.decision === "not_approved" ? input.reasonCode : null,
      reason_note: input.reasonNote ?? null,
      decided_by: input.operatorId,
      decided_at: appNow.toISOString(),
    })
    .eq("id", input.rstId);
  if (updateError) return { ok: false as const, error: updateError.message };
  const services = await getServiceRows(row.person_id);
  const profile = await getProfile(row.person_id);
  const derived = deriveProfileState(services.map((item) => item.status as RstStatus));
  const nextState = profile?.state === "paused" ? "paused" : derived;
  const patch: Record<string, unknown> = { state: nextState, updated_at: appNow.toISOString() };
  if (input.decision === "approved" && profile && !profile.first_approved_at) {
    patch.first_approved_at = appNow.toISOString();
  }
  await admin().from("retiree_profiles").update(patch).eq("person_id", row.person_id);
  const types = await getServiceTypes();
  const name = types.find((item) => item.id === row.service_type_id)?.name ?? "Service Type";
  if (input.decision === "approved") {
    await notifyPerson(row.person_id, {
      title: `${name} is approved`,
      body: "This Service Type is approved. Finish the go-live checklist if you have not already.",
      linkFor: (id) => `/phone/${id}/opportunities/retiree/status`,
    });
  } else {
    const reason = input.reasonCode ? REASON_CODES[input.reasonCode] : "See the note in your application.";
    await notifyPerson(row.person_id, {
      title: `Action needed: ${name}`,
      body: input.reasonNote ? `${reason} ${input.reasonNote}` : reason,
      linkFor: (id) => `/phone/${id}/opportunities/retiree/status`,
    });
  }
  await audit(input.operatorId, input.decision === "approved" ? "rst.approved" : "rst.not_approved", "retiree_service_type", input.rstId, {
    personId: row.person_id,
    reasonCode: input.reasonCode ?? null,
  });
  return { ok: true as const };
}
