import { settleAction } from "@/app/actions/flow";
import { settlementSnapshot } from "@/lib/domain/settlement";
import { getSettings } from "@/lib/domain/settings";
import { formatMonthKey, money } from "@/lib/format";
import { getAppNow } from "@/lib/domain/clock";

export default async function SettlementPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = await params;
  const [snap, settings, appNow] = await Promise.all([settlementSnapshot(), getSettings(), getAppNow()]);
  const names = new Map(snap.people.map((row) => [row.id, row.full_name]));
  const period = settings.last_settlement_period ?? formatMonthKey(appNow);
  return (
    <div className="space-y-3">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Settlement</h1>
      <p>Last settled period: {settings.last_settlement_period ?? "none"}</p>
      <form action={async () => { "use server"; await settleAction(period, operatorId); }}>
        <button className="rounded-full bg-gosi-vivid-green px-4 py-2 text-gosi-rich-blue" type="submit">Run settlement for {period}</button>
      </form>
      <a className="text-gosi-blue" href={`/ops/${operatorId}/settlement/csv`}>Download CSV</a>
      <h2 className="text-gosi-blue">Released and not paid out</h2>
      {snap.payments.map((row) => <p key={row.id}>{money(row.amount)} · booking {row.booking_id}</p>)}
      {!snap.payments.length && <p>Nothing is waiting.</p>}
      <h2 className="text-gosi-blue">Past payouts</h2>
      {snap.payouts.map((row) => <p key={row.id}>{names.get(row.retiree_id) ?? "Retiree"} · {row.period} · {money(row.amount)} · {row.iban_masked}</p>)}
    </div>
  );
}
