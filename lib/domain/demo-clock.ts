import { audit } from "@/lib/domain/audit";
import { getAppNow, getClockOffset, setClockOffset } from "@/lib/domain/clock";
import { processDue } from "@/lib/domain/jobs";
import { monthEndTarget } from "@/lib/domain/rules";
import { broadcast } from "@/lib/realtime";
import { admin } from "@/lib/supabase/admin";

async function commit(offset: number, action: string, details: Record<string, unknown>) {
  await setClockOffset(offset);
  await broadcast("demo", "clock.changed", { offset });
  await processDue();
  await audit("system", action, "app_settings", "1", details);
}

export async function shiftClock(seconds: number) {
  const offset = await getClockOffset();
  await commit(offset + seconds, "clock.shifted", { seconds });
}

export async function resetClock() {
  await commit(0, "clock.reset", {});
}

export async function jumpToDate(target: Date) {
  const appNow = await getAppNow();
  if (target.getTime() + 1000 < appNow.getTime()) {
    return { ok: false as const, error: "The demo clock only moves forward. Reset demo data to go back." };
  }
  const offset = Math.round((target.getTime() - Date.now()) / 1000);
  await commit(offset, "clock.jumped", { to: target.toISOString() });
  return { ok: true as const };
}

export async function jumpToMonthEnd() {
  const appNow = await getAppNow();
  return jumpToDate(monthEndTarget(appNow));
}

export async function jumpToNextBooking() {
  const appNow = await getAppNow();
  const { data, error } = await admin()
    .from("bookings")
    .select("id, starts_at, seeker_id, retiree_id")
    .eq("status", "confirmed")
    .gt("starts_at", appNow.toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "There is no upcoming confirmed session." };
  const target = new Date(new Date(data.starts_at).getTime() - 5 * 60 * 1000);
  const jumped = await jumpToDate(target);
  if (!jumped.ok) return jumped;
  return { ok: true as const, bookingId: data.id as string, seekerId: data.seeker_id as string, retireeId: data.retiree_id as string };
}

export async function nextBookingLabel() {
  const appNow = await getAppNow();
  const { data } = await admin()
    .from("bookings")
    .select("id, starts_at, seeker_id, retiree_id")
    .eq("status", "confirmed")
    .gt("starts_at", appNow.toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const { data: people } = await admin().from("gosi_people").select("id, first_name").in("id", [data.seeker_id, data.retiree_id]);
  const name = new Map((people ?? []).map((row) => [row.id, row.first_name]));
  const { data: personas } = await admin().from("personas").select("id, person_id").in("person_id", [data.seeker_id, data.retiree_id]);
  const slug = new Map((personas ?? []).map((row) => [row.person_id, row.id]));
  return {
    id: data.id as string,
    startsAt: data.starts_at as string,
    seeker: name.get(data.seeker_id) ?? "Seeker",
    retiree: name.get(data.retiree_id) ?? "Retiree",
    seekerSlug: slug.get(data.seeker_id) ?? "",
    retireeSlug: slug.get(data.retiree_id) ?? "",
  };
}
