import { notFound } from "next/navigation";
import { PaySheet } from "@/components/phone/pay-sheet";
import { getBooking } from "@/lib/domain/bookings";
import { getClockOffset } from "@/lib/domain/clock";
import { requireUser } from "@/lib/domain/personas";

export default async function PayPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking || booking.seeker_id !== user.person.id || !booking.hold_expires_at) notFound();
  const offset = await getClockOffset();
  return <PaySheet bookingId={bookingId} seekerId={user.person.id} personaId={personaId} amount={Number(booking.price)} holdExpires={booking.hold_expires_at} offset={offset} />;
}
