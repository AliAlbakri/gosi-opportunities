import Link from "next/link";
import { reviewQueue } from "@/lib/domain/review";

export default async function ReviewPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = await params;
  const rows = await reviewQueue();
  return (
    <div className="space-y-3">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Review queue</h1>
      {rows.map((row) => <Link key={row.person_id} className="block rounded-2xl bg-white p-4" href={`/ops/${operatorId}/review/${row.person_id}`}>{row.full_name} · {row.mobile}</Link>)}
      {!rows.length && <p>Nothing is waiting for review.</p>}
    </div>
  );
}
