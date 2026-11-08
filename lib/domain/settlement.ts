import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notifyPerson } from "@/lib/domain/notifications";
import { setLastSettlement } from "@/lib/domain/settings";
import { formatMonthKey, money } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

export async function runSettlement(period: string, actor: string) {
  const { data: payments, error } = await admin().from("payments").select("*").eq("status", "released").is("payout_id", null);
  if (error) throw new Error(error.message);
  const due = (payments ?? []).filter((row) => row.released_at && formatMonthKey(row.released_at) <= period);
  const bookingIds = due.map((row) => row.booking_id);
  const { data: bookings } = bookingIds.length
    ? await admin().from("bookings").select("id, retiree_id").in("id", bookingIds)
    : { data: [] };
  const retireeOf = new Map((bookings ?? []).map((row) => [row.id, row.retiree_id as string]));
  const grouped = new Map<string, typeof due>();
  for (const payment of due) {
    const retireeId = retireeOf.get(payment.booking_id);
    if (!retireeId) continue;
    const list = grouped.get(retireeId) ?? [];
    list.push(payment);
    grouped.set(retireeId, list);
  }
  const appNow = await getAppNow();
  const retireeIds = [...grouped.keys()];
  const { data: people } = retireeIds.length
    ? await admin().from("gosi_people").select("id, pension_bank, pension_iban_masked").in("id", retireeIds)
    : { data: [] };
  const personOf = new Map((people ?? []).map((row) => [row.id, row]));
  let count = 0;
  for (const [retireeId, rows] of grouped) {
    const amount = rows.reduce((sum, row) => sum + Number(row.amount), 0);
    const person = personOf.get(retireeId);
    const { data: payout, error: payoutError } = await admin()
      .from("payouts")
      .insert({
        retiree_id: retireeId,
        period,
        amount,
        bank: person?.pension_bank ?? null,
        iban_masked: person?.pension_iban_masked ?? null,
        paid_at: appNow.toISOString(),
      })
      .select("id")
      .single();
    if (payoutError) {
      if (payoutError.code === "23505") continue;
      throw new Error(payoutError.message);
    }
    await admin()
      .from("payments")
      .update({ status: "paid_out", paid_out_at: appNow.toISOString(), payout_id: payout.id })
      .in("id", rows.map((row) => row.id))
      .eq("status", "released");
    await notifyPerson(retireeId, {
      title: `${money(amount)} sent to your pension bank account`,
      body: "It's a separate transfer, not part of your pension.",
      linkFor: (id) => `/phone/${id}/opportunities/retiree/earnings`,
    });
    count += 1;
  }
  await setLastSettlement(period);
  await audit(actor, "settlement.ran", "payout", period, { payouts: count, period });
  return { payouts: count };
}

export async function settlementSnapshot() {
  const { data: payments, error } = await admin().from("payments").select("*").eq("status", "released").is("payout_id", null);
  if (error) throw new Error(error.message);
  const { data: payouts, error: payoutError } = await admin().from("payouts").select("*").order("paid_at", { ascending: false });
  if (payoutError) throw new Error(payoutError.message);
  const bookingIds = (payments ?? []).map((row) => row.booking_id);
  const { data: bookings } = bookingIds.length
    ? await admin().from("bookings").select("id, retiree_id").in("id", bookingIds)
    : { data: [] };
  const retireeIds = [...new Set([...(bookings ?? []).map((row) => row.retiree_id), ...(payouts ?? []).map((row) => row.retiree_id)])];
  const { data: people } = retireeIds.length
    ? await admin().from("gosi_people").select("id, full_name, pension_bank, pension_iban_masked").in("id", retireeIds)
    : { data: [] };
  return { payments: payments ?? [], payouts: payouts ?? [], bookings: bookings ?? [], people: people ?? [] };
}

export function csvFor(rows: { name: string; amount: number; bank: string; iban: string; period: string }[]) {
  const header = ["Retiree", "Amount SAR", "Bank", "IBAN", "Period"];
  const lines = [header, ...rows.map((row) => [row.name, String(row.amount), row.bank, row.iban, row.period])];
  return lines.map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}
