import { admin } from "@/lib/supabase/admin";

let cache: { at: number; offset: number } | null = null;

export function clearClockCache() {
  cache = null;
}

export async function getClockOffset() {
  if (cache && Date.now() - cache.at < 2000) return cache.offset;
  const { data, error } = await admin()
    .from("app_settings")
    .select("demo_clock_offset_seconds")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  const offset = Number(data.demo_clock_offset_seconds ?? 0);
  cache = { at: Date.now(), offset };
  return offset;
}

/** App time is the only clock business rules may use. */
export async function getAppNow() {
  const offset = await getClockOffset();
  return new Date(Date.now() + offset * 1000);
}

export async function setClockOffset(offsetSeconds: number) {
  const { error } = await admin()
    .from("app_settings")
    .update({ demo_clock_offset_seconds: Math.round(offsetSeconds), updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  clearClockCache();
}
