import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBooking } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { requireUser } from "@/lib/domain/personas";
import { eventsForBooking, phaseFor } from "@/lib/domain/sessions";
import { copy } from "@/lib/copy";

export default async function LeftPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking) notFound();
  if (booking.seeker_id !== user.person.id && booking.retiree_id !== user.person.id) notFound();
  const party = booking.seeker_id === user.person.id ? "seeker" : "retiree";
  const phase = phaseFor(booking, await eventsForBooking(bookingId), user.person.id, await getAppNow());
  const base = `/phone/${personaId}/opportunities`;
  if (phase.phase !== "open" && phase.phase !== "live" && phase.phase !== "overtime") {
    redirect(party === "seeker" ? `${base}/bookings/${bookingId}/feedback` : `${base}/bookings/${bookingId}/done`);
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center text-gosi-rich-blue">
      <h1 className="text-[22px] font-semibold">{copy.session.youLeft}</h1>
      <Link href={`${base}/bookings/${bookingId}/lobby`} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-rich-blue text-[15px] font-semibold text-white">{copy.session.rejoin}</Link>
      <Link href={party === "seeker" ? `${base}/bookings/${bookingId}/feedback` : `${base}/bookings/${bookingId}/done`} className="text-[15px] font-semibold text-gosi-blue">{copy.session.imDone}</Link>
    </div>
  );
}
