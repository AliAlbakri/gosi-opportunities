import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/phone/feedback-form";
import { getBooking } from "@/lib/domain/bookings";
import { requireUser } from "@/lib/domain/personas";

export default async function FeedbackPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking || booking.seeker_id !== user.person.id) notFound();
  return <FeedbackForm personaId={personaId} bookingId={bookingId} seekerId={user.person.id} retireeId={booking.retiree_id} />;
}
