import { csvFor, settlementSnapshot } from "@/lib/domain/settlement";

export async function GET() {
  const snap = await settlementSnapshot();
  const names = new Map(snap.people.map((row) => [row.id, row]));
  const csv = csvFor(snap.payouts.map((row) => ({
    name: names.get(row.retiree_id)?.full_name ?? "Retiree",
    amount: Number(row.amount),
    bank: row.bank ?? "",
    iban: row.iban_masked ?? "",
    period: row.period,
  })));
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=settlement.csv" } });
}
