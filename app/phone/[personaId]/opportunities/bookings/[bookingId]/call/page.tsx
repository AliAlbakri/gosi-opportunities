import { notFound } from "next/navigation";
import { CallFrame } from "@/components/phone/call-frame";
import { getBooking } from "@/lib/domain/bookings";
import { getClockOffset } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";

export default async function CallPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking) notFound();
  if (booking.seeker_id !== user.person.id && booking.retiree_id !== user.person.id) notFound();
  const [row] = await decorateBookings([booking]);
  const offset = await getClockOffset();
  return <CallFrame bookingId={bookingId} personId={user.person.id} personaId={personaId} name={user.person.first_name} offset={offset} serviceName={row.serviceName} startsAt={booking.starts_at} role={booking.seeker_id === user.person.id ? "seeker" : "retiree"} />;
}
