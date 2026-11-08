import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { admin, broadcast } from "@/lib/supabase/admin";
import type { AppSettings, Category } from "@/lib/types";

function num(value: unknown) {
  return Number(value ?? 0);
}

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await admin().from("app_settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  return {
    ...data,
    demo_clock_offset_seconds: num(data.demo_clock_offset_seconds),
    price_floor: num(data.price_floor),
    price_ceiling: num(data.price_ceiling),
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await admin().from("categories").select("*").order("sort");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...row, suggested_price: num(row.suggested_price) }));
}

export async function getServiceTypes() {
  const { data, error } = await admin().from("service_types").select("*").order("sort");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveTechSettings(input: {
  paidEnabled: boolean;
  floor: number;
  ceiling: number;
  suggested: Record<string, number>;
}) {
  const current = await getSettings();
  const { error } = await admin()
    .from("app_settings")
    .update({
      paid_enabled: input.paidEnabled,
      price_floor: input.floor,
      price_ceiling: input.ceiling,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  for (const [id, price] of Object.entries(input.suggested)) {
    const { error: catError } = await admin().from("categories").update({ suggested_price: price }).eq("id", id);
    if (catError) throw new Error(catError.message);
  }
  const clamped = await clampPrices(input.floor, input.ceiling);
  await audit("tech", "settings.saved", "app_settings", "1", {
    paidEnabled: input.paidEnabled,
    floor: input.floor,
    ceiling: input.ceiling,
    wasPaid: current.paid_enabled,
  });
  await broadcast("demo", "settings.changed", { paidEnabled: input.paidEnabled });
  return clamped;
}

async function clampPrices(floor: number, ceiling: number) {
  const { data, error } = await admin()
    .from("retiree_service_types")
    .select("id, person_id, price, pricing_mode")
    .eq("pricing_mode", "paid");
  if (error) throw new Error(error.message);
  const affected = new Set<string>();
  for (const row of data ?? []) {
    const price = num(row.price);
    let next = price;
    if (price < floor) next = floor;
    if (price > ceiling) next = ceiling;
    if (next !== price) {
      await admin().from("retiree_service_types").update({ price: next }).eq("id", row.id);
      affected.add(row.person_id);
    }
  }
  for (const personId of affected) {
    await notifyPerson(personId, {
      title: "Your price was updated",
      body: "A GOSI price band change moved one of your prices to the nearest limit. This applies to new bookings.",
      linkFor: (id) => `/phone/${id}/opportunities/retiree/profile`,
    });
  }
  return affected.size;
}

export async function setLastSettlement(period: string) {
  const { error } = await admin().from("app_settings").update({ last_settlement_period: period }).eq("id", 1);
  if (error) throw new Error(error.message);
}

export async function touchProfile(personId: string) {
  const now = await getAppNow();
  await admin().from("retiree_profiles").update({ updated_at: now.toISOString() }).eq("person_id", personId);
}
