import { notFound } from "next/navigation";
import { copy } from "@/lib/copy";
import { earnings } from "@/lib/domain/pricing";
import { requireUser } from "@/lib/domain/personas";
import { formatWhen, money } from "@/lib/format";

export default async function EarningsPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const data = await earnings(user.person.id);
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Earnings</h1>
      <p>Held {money(data.totals.held)}. {copy.heldDef}</p>
      <p>Released {money(data.totals.released)}. {copy.releasedDef}</p>
      <p>Paid out {money(data.totals.paid_out)}. {copy.paidOutDef}</p>
      {data.payments.map((payment) => <p key={payment.id}>{money(payment.amount)} · {payment.status}</p>)}
      {data.payouts.map((payout) => <p key={payout.id}>{formatWhen(payout.paid_at)} · {money(payout.amount)} · {payout.iban_masked}</p>)}
      {!data.payments.length && <p>No paid sessions yet.</p>}
    </div>
  );
}
