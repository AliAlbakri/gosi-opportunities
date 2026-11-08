import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { employmentFor, getPersonByNationalId } from "@/lib/domain/personas";
import { yearsOfEmployment } from "@/lib/domain/rules";
import { admin } from "@/lib/supabase/admin";
import type { GosiPerson, WaveFilters } from "@/lib/types";

type Candidate = GosiPerson & { years: number; sector: string };

async function retireePool(appNow: Date): Promise<Candidate[]> {
  const [{ data: people, error }, { data: jobs, error: jobError }, { data: invited, error: invError }] =
    await Promise.all([
      admin().from("gosi_people").select("*").eq("is_retiree", true),
      admin().from("gosi_employment").select("*"),
      admin().from("invitations").select("person_id"),
    ]);
  if (error) throw new Error(error.message);
  if (jobError) throw new Error(jobError.message);
  if (invError) throw new Error(invError.message);
  const invitedIds = new Set((invited ?? []).map((row) => row.person_id));
  const byPerson = new Map<string, { start_date: string; end_date: string | null; sector: string }[]>();
  for (const job of jobs ?? []) {
    const list = byPerson.get(job.person_id) ?? [];
    list.push(job);
    byPerson.set(job.person_id, list);
  }
  return (people ?? [])
    .filter((person) => !invitedIds.has(person.id))
    .map((person) => {
      const rows = byPerson.get(person.id) ?? [];
      const latest = [...rows].sort((a, b) => (b.end_date ?? "9999").localeCompare(a.end_date ?? "9999"))[0];
      return {
        ...person,
        years: yearsOfEmployment(rows, appNow),
        sector: latest?.sector ?? "Other",
      };
    });
}

export function matchFilters(person: Candidate, filters: WaveFilters) {
  if (filters.pensionSystems.length && !filters.pensionSystems.includes(person.pension_system!)) return false;
  if (filters.regions.length && !filters.regions.includes(person.region ?? "")) return false;
  if (filters.sectors.length && !filters.sectors.includes(person.sector)) return false;
  if (filters.minYears > 0 && person.years < filters.minYears) return false;
  return true;
}

export async function previewWave(filters: WaveFilters) {
  const appNow = await getAppNow();
  const matches = (await retireePool(appNow)).filter((person) => matchFilters(person, filters));
  matches.sort((a, b) => a.full_name.localeCompare(b.full_name));
  const breakdown: Record<string, number> = {};
  for (const person of matches) breakdown[person.sector] = (breakdown[person.sector] ?? 0) + 1;
  return { count: matches.length, breakdown, sample: matches.slice(0, 8).map((p) => p.full_name) };
}

export async function sendWave(input: { name: string; filters: WaveFilters; sizeCap: number; operatorId: string }) {
  const appNow = await getAppNow();
  const matches = (await retireePool(appNow))
    .filter((person) => matchFilters(person, input.filters))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .slice(0, input.sizeCap);
  const { data: wave, error } = await admin()
    .from("invitation_waves")
    .insert({
      name: input.name,
      filters: input.filters,
      size_cap: input.sizeCap,
      status: "sent",
      created_by: input.operatorId,
      sent_at: appNow.toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (matches.length) {
    const { error: invError } = await admin().from("invitations").insert(
      matches.map((person) => ({
        person_id: person.id,
        wave_id: wave.id,
        invited_by: input.operatorId,
        invited_at: appNow.toISOString(),
      })),
    );
    if (invError) throw new Error(invError.message);
  }
  for (const person of matches) {
    await notifyPerson(person.id, {
      title: "You're invited to GOSI Opportunities",
      body: "Share your experience in a one-hour video session. Open the invite on your home screen to start.",
      linkFor: (id) => `/phone/${id}/opportunities/retiree`,
    });
  }
  await audit(input.operatorId, "wave.sent", "invitation_wave", wave.id, {
    name: input.name,
    sent: matches.length,
    cap: input.sizeCap,
  });
  return { sent: matches.length };
}

export async function lookupForInvite(nationalId: string) {
  const person = await getPersonByNationalId(nationalId.trim());
  if (!person) return { error: "No GOSI record matches that National ID." };
  if (!person.is_retiree) return { error: "This person is not a retiree." };
  const { data: existing } = await admin().from("invitations").select("id").eq("person_id", person.id).maybeSingle();
  if (existing) return { error: "This retiree already has an invitation." };
  const jobs = await employmentFor(person.id);
  return { person, jobs };
}

export async function inviteOne(nationalId: string, operatorId: string) {
  const found = await lookupForInvite(nationalId);
  if ("error" in found && found.error) return { ok: false as const, error: found.error };
  if (!("person" in found) || !found.person) return { ok: false as const, error: "No GOSI record matches that National ID." };
  const appNow = await getAppNow();
  const { error } = await admin().from("invitations").insert({
    person_id: found.person.id,
    wave_id: null,
    invited_by: operatorId,
    invited_at: appNow.toISOString(),
  });
  if (error) return { ok: false as const, error: error.message };
  await notifyPerson(found.person.id, {
    title: "You're invited to GOSI Opportunities",
    body: "Share your experience in a one-hour video session. Open the invite on your home screen to start.",
    linkFor: (id) => `/phone/${id}/opportunities/retiree`,
  });
  await audit(operatorId, "invitation.sent", "gosi_person", found.person.id, { source: "national-id" });
  return { ok: true as const };
}

export async function listWaves() {
  const { data: waves, error } = await admin().from("invitation_waves").select("*").order("sent_at", { ascending: false });
  if (error) throw new Error(error.message);
  const { data: invitations, error: invError } = await admin().from("invitations").select("*");
  if (invError) throw new Error(invError.message);
  const { data: profiles, error: profileError } = await admin().from("retiree_profiles").select("person_id, state, submitted_at, first_approved_at");
  if (profileError) throw new Error(profileError.message);
  const { data: bookings, error: bookingError } = await admin()
    .from("bookings")
    .select("retiree_id, status")
    .eq("status", "completed");
  if (bookingError) throw new Error(bookingError.message);
  const delivered = new Set((bookings ?? []).map((row) => row.retiree_id));
  const profileByPerson = new Map((profiles ?? []).map((row) => [row.person_id, row]));
  return (waves ?? []).map((wave) => {
    const rows = (invitations ?? []).filter((row) => row.wave_id === wave.id);
    const stats = {
      invited: rows.length,
      opened: rows.filter((row) => row.opened_at).length,
      started: 0,
      submitted: 0,
      approved: 0,
      delivered: 0,
    };
    for (const row of rows) {
      const profile = profileByPerson.get(row.person_id);
      if (profile) stats.started += 1;
      if (profile?.submitted_at) stats.submitted += 1;
      if (profile?.first_approved_at || profile?.state === "active" || profile?.state === "paused") stats.approved += 1;
      if (delivered.has(row.person_id)) stats.delivered += 1;
    }
    return { ...wave, stats };
  });
}

export async function markInvitationOpened(personId: string) {
  const appNow = await getAppNow();
  await admin()
    .from("invitations")
    .update({ opened_at: appNow.toISOString() })
    .eq("person_id", personId)
    .is("opened_at", null);
}

export async function getInvitation(personId: string) {
  const { data, error } = await admin().from("invitations").select("*").eq("person_id", personId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function filterOptions() {
  const [{ data: people }, { data: jobs }] = await Promise.all([
    admin().from("gosi_people").select("region").eq("is_retiree", true),
    admin().from("gosi_employment").select("sector"),
  ]);
  const regions = [...new Set((people ?? []).map((row) => row.region).filter(Boolean))] as string[];
  const sectors = [...new Set((jobs ?? []).map((row) => row.sector))];
  regions.sort();
  sectors.sort();
  return { regions, sectors };
}
