import { audit } from "@/lib/domain/audit";
import { cancelFutureForRetiree } from "@/lib/domain/bookings";
import { getSettings } from "@/lib/domain/settings";
import { admin, broadcast } from "@/lib/supabase/admin";

export async function setServicePrice(personId: string, personaId: string, rstId: string, mode: "free" | "paid", price: number | null) {
  const settings = await getSettings();
  if (!settings.paid_enabled) return { ok: false as const, error: "Paid sessions are switched off." };
  if (mode === "paid") {
    if (price == null || price < settings.price_floor || price > settings.price_ceiling) {
      return { ok: false as const, error: `Choose a price between SAR ${settings.price_floor} and SAR ${settings.price_ceiling}.` };
    }
  }
  const { error } = await admin()
    .from("retiree_service_types")
    .update({ pricing_mode: mode, price: mode === "paid" ? price : null })
    .eq("id", rstId)
    .eq("person_id", personId)
    .eq("status", "approved");
  if (error) return { ok: false as const, error: error.message };
  await audit(personaId, "price.updated", "retiree_service_type", rstId, { mode, price });
  return { ok: true as const };
}

export async function futurePaidCount() {
  const { count, error } = await admin()
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("is_paid", true)
    .in("status", ["confirmed", "pending_payment"]);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function switchPaidOff() {
  const { data, error } = await admin()
    .from("bookings")
    .select("retiree_id")
    .eq("is_paid", true)
    .in("status", ["confirmed", "pending_payment"]);
  if (error) throw new Error(error.message);
  const retirees = [...new Set((data ?? []).map((row) => row.retiree_id as string))];
  let cancelled = 0;
  for (const retireeId of retirees) {
    cancelled += await cancelFutureForRetiree(retireeId, "system", "system", "Paid sessions switched off", {
      paidOnly: true,
      title: "Paid session cancelled and refunded",
      body: "Paid sessions are switched off. This booking was cancelled and any payment is being refunded.",
    });
  }
  await admin().from("retiree_service_types").update({ pricing_mode: "free", price: null }).eq("pricing_mode", "paid");
  const { error: settingsError } = await admin().from("app_settings").update({ paid_enabled: false }).eq("id", 1);
  if (settingsError) throw new Error(settingsError.message);
  await audit("tech", "paid.switched_off", "app_settings", "1", { cancelled });
  await broadcast("demo", "settings.changed", { paidEnabled: false });
  return cancelled;
}

export async function earnings(personId: string) {
  const { data: bookings, error } = await admin().from("bookings").select("id, starts_at, status, price, is_paid").eq("retiree_id", personId).eq("is_paid", true);
  if (error) throw new Error(error.message);
  const ids = (bookings ?? []).map((row) => row.id);
  const { data: payments } = ids.length ? await admin().from("payments").select("*").in("booking_id", ids) : { data: [] };
  const { data: payouts } = await admin().from("payouts").select("*").eq("retiree_id", personId).order("paid_at", { ascending: false });
  const totals = { held: 0, released: 0, paid_out: 0, refunded: 0 };
  for (const payment of payments ?? []) {
    const amount = Number(payment.amount);
    if (payment.status === "held") totals.held += amount;
    if (payment.status === "released") totals.released += amount;
    if (payment.status === "paid_out") totals.paid_out += amount;
    if (payment.status === "refunded") totals.refunded += amount;
  }
  return { bookings: bookings ?? [], payments: payments ?? [], payouts: payouts ?? [], totals };
}
