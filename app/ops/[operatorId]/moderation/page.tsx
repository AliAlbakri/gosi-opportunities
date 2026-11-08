import { moderateAction } from "@/app/actions/flow";
import { pendingReviews } from "@/lib/domain/feedback";

export default async function ModerationPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = await params;
  const rows = await pendingReviews();
  return (
    <div className="space-y-3">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Review moderation</h1>
      {rows.map((row) => (
        <article key={row.booking_id} className="rounded-2xl bg-white p-4">
          <p>{row.review_text}</p>
          <div className="mt-2 flex gap-2">
            <form action={async () => { "use server"; await moderateAction(operatorId, row.booking_id, "approved"); }}><button className="rounded-full bg-gosi-vivid-green px-3 py-1 text-gosi-rich-blue" type="submit">Approve</button></form>
            <form action={async () => { "use server"; await moderateAction(operatorId, row.booking_id, "rejected"); }}><button className="rounded-full border px-3 py-1" type="submit">Reject</button></form>
          </div>
        </article>
      ))}
      {!rows.length && <p>No written reviews are waiting.</p>}
    </div>
  );
}
