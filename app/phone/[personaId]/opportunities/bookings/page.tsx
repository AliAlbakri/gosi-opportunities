import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelButton } from "@/components/phone/cancel-button";
import { bookingsForPerson } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { formatWhen } from "@/lib/format";
import { copy } from "@/lib/copy";

export default async function BookingsPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const appNow = await getAppNow();
  const rows = await decorateBookings(await bookingsForPerson(user.person.id));
  const upcoming = rows.filter((row) => ["confirmed", "pending_payment"].includes(row.status) && new Date(row.starts_at) >= appNow);
  const past = rows.filter((row) => !upcoming.includes(row));
  const Card = ({ row, past }: { row: (typeof rows)[number]; past?: boolean }) => {
    const start = new Date(row.starts_at).getTime();
    const seeker = row.seeker_id === user.person.id;
    const canJoin = row.status === "confirmed" && appNow.getTime() >= start - 10 * 60 * 1000 && appNow.getTime() <= new Date(row.ends_at).getTime() + 30 * 60 * 1000;
    const canCancel = (row.status === "confirmed" || row.status === "pending_payment") && start > appNow.getTime();
    return (
      <article className="rounded-3xl bg-white p-4">
        <Link href={`/phone/${personaId}/opportunities/bookings/${row.id}`}>
          <p className="font-medium">{seeker ? row.retireeName : row.seekerName}</p>
          <p>{formatWhen(row.starts_at)}</p>
          <p className="text-sm">{row.serviceName}</p>
          {!seeker && <p className="text-sm">{row.seeker_need}</p>}
          <p className="text-sm">{row.is_paid ? "Paid" : "Free"} · {row.status.replaceAll("_", " ")}</p>
        </Link>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {canJoin && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${row.id}/call`}>{copy.join}</Link>}
          {canCancel && <CancelButton bookingId={row.id} personId={user.person.id} personaId={personaId} party={seeker ? "seeker" : "retiree"} />}
          {past && seeker && row.status === "completed" && !row.rated && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${row.id}/feedback`}>Rate session</Link>}
          {past && seeker && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${row.id}/report`}>Report a problem</Link>}
          {past && seeker && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/p/${row.retiree_id}`}>Book again</Link>}
        </div>
      </article>
    );
  };
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">My bookings</h1>
      <h2>Upcoming</h2>
      {upcoming.map((row) => <Card key={row.id} row={row} />)}
      {!upcoming.length && <p>No upcoming sessions.</p>}
      <h2>Past</h2>
      {past.map((row) => <Card key={row.id} row={row} past />)}
      {!past.length && <p>No past sessions.</p>}
    </div>
  );
}
