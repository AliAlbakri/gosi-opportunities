import { notFound } from "next/navigation";
import { ReportForm } from "@/components/phone/report-form";
import { getBooking } from "@/lib/domain/bookings";
import { requireUser } from "@/lib/domain/personas";

export default async function ReportPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking || booking.seeker_id !== user.person.id) notFound();
  return <ReportForm personaId={personaId} bookingId={bookingId} reporterId={user.person.id} />;
}
