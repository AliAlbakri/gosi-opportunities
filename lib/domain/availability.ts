import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notify } from "@/lib/domain/notifications";
import { getProfile } from "@/lib/domain/applications";
import { checklistDone, slotHours } from "@/lib/domain/rules";
import { admin } from "@/lib/supabase/admin";

export async function listWindows(personId: string) {
  const { data, error } = await admin()
    .from("availability_windows")
    .select("*")
    .eq("person_id", personId)
    .order("weekday")
    .order("start_time");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceWindows(
  personId: string,
  personaId: string,
  windows: { weekday: number; start: string; end: string }[],
) {
  for (const window of windows) {
    if (window.weekday < 0 || window.weekday > 6) return { ok: false as const, error: "Choose a weekday." };
    const hours = slotHours(`${window.start}:00`, `${window.end}:00`);
    if (!hours.length) return { ok: false as const, error: "Each window needs at least one whole hour between 06:00 and 23:00." };
  }
  const { error: deleteError } = await admin().from("availability_windows").delete().eq("person_id", personId);
  if (deleteError) return { ok: false as const, error: deleteError.message };
  if (windows.length) {
    const { error } = await admin().from("availability_windows").insert(
      windows.map((window) => ({
        person_id: personId,
        weekday: window.weekday,
        start_time: window.start.length === 5 ? `${window.start}:00` : window.start,
        end_time: window.end.length === 5 ? `${window.end}:00` : window.end,
      })),
    );
    if (error) return { ok: false as const, error: error.message };
  }
  await audit(personaId, "availability.updated", "retiree_profile", personId, { windows: windows.length });
  await maybeLive(personId, personaId);
  return { ok: true as const };
}

export async function setAcceptingBookings(personId: string, personaId: string, accepting: boolean) {
  const { error } = await admin().from("retiree_profiles").update({ accepting_bookings: accepting }).eq("person_id", personId);
  if (error) return { ok: false as const, error: error.message };
  await audit(personaId, accepting ? "bookings.resumed" : "bookings.self_paused", "retiree_profile", personId, {});
  return { ok: true as const };
}

export async function markOnboardingWatched(personId: string, personaId: string) {
  const appNow = await getAppNow();
  await admin()
    .from("retiree_profiles")
    .update({ onboarding_watched_at: appNow.toISOString() })
    .eq("person_id", personId)
    .is("onboarding_watched_at", null);
  await audit(personaId, "onboarding.watched", "retiree_profile", personId, {});
  await maybeLive(personId, personaId);
}

export async function markReadiness(personId: string, personaId: string) {
  const appNow = await getAppNow();
  await admin()
    .from("retiree_profiles")
    .update({ readiness_passed_at: appNow.toISOString() })
    .eq("person_id", personId)
    .is("readiness_passed_at", null);
  await audit(personaId, "readiness.passed", "retiree_profile", personId, {});
  await maybeLive(personId, personaId);
}

async function maybeLive(personId: string, personaId: string) {
  const profile = await getProfile(personId);
  if (!profile || profile.state !== "active") return;
  const windows = await listWindows(personId);
  if (!checklistDone(profile, windows.length)) return;
  const { data: existing } = await admin()
    .from("audit_log")
    .select("id")
    .eq("action", "retiree.live")
    .eq("entity_id", personId)
    .limit(1);
  if (existing?.length) return;
  await audit(personaId, "retiree.live", "retiree_profile", personId, {});
  await notify(personaId, {
    title: "You're live on GOSI Opportunities",
    body: "Seekers can now find you and book a session.",
    link: `/phone/${personaId}/opportunities/retiree`,
  });
}
