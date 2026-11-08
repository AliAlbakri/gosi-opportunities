import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelButton } from "@/components/phone/cancel-button";
import { getBooking } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { formatWhen, money } from "@/lib/format";
import { copy } from "@/lib/copy";

export default async function BookingPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking) notFound();
  if (booking.seeker_id !== user.person.id && booking.retiree_id !== user.person.id) notFound();
  const [row] = await decorateBookings([booking]);
  const appNow = await getAppNow();
  const start = new Date(booking.starts_at).getTime();
  const canJoin = booking.status === "confirmed" && appNow.getTime() >= start - 10 * 60 * 1000 && appNow.getTime() <= new Date(booking.ends_at).getTime() + 30 * 60 * 1000;
  const canCancel = (booking.status === "confirmed" || booking.status === "pending_payment") && start > appNow.getTime();
  const party = booking.seeker_id === user.person.id ? "seeker" : "retiree";
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">{row.serviceName}</h1>
      <p>{formatWhen(booking.starts_at)}</p>
      <p>{party === "seeker" ? row.retireeName : row.seekerName}</p>
      <p>{booking.is_paid ? money(booking.price) : "Free"} · {booking.status.replaceAll("_", " ")}</p>
      {party === "retiree" && <><p>Need: {booking.seeker_need}</p><p>Goal: {booking.seeker_goal}</p></>}
      <p className="text-sm">{copy.disclaimer}</p>
      {booking.status === "pending_payment" && party === "seeker" && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${bookingId}/pay`}>Continue to payment</Link>}
      {canJoin && <Link className="inline-flex h-[52px] items-center rounded-full bg-gosi-vivid-green px-6 text-gosi-rich-blue" href={`/phone/${personaId}/opportunities/bookings/${bookingId}/call`}>{copy.join}</Link>}
      {canCancel && <CancelButton bookingId={bookingId} personId={user.person.id} personaId={personaId} party={party} />}
      {booking.status === "completed" && party === "seeker" && !row.rated && <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${bookingId}/feedback`}>Rate session</Link>}
      {party === "seeker" && start <= appNow.getTime() && <Link className="block text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${bookingId}/report`}>Report a problem</Link>}
      {party === "seeker" && start <= appNow.getTime() && <Link className="block text-gosi-blue" href={`/phone/${personaId}/opportunities/p/${booking.retiree_id}`}>Book again</Link>}
    </div>
  );
}
