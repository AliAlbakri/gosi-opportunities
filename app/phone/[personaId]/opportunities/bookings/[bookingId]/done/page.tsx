import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoSessionIllustration } from "@/components/illustrations/spots";
import { getBooking } from "@/lib/domain/bookings";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { copy } from "@/lib/copy";

export default async function DonePage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking || booking.retiree_id !== user.person.id) notFound();
  const [row] = await decorateBookings([booking]);
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center text-gosi-rich-blue">
      <VideoSessionIllustration className="h-28 w-36" />
      <h1 className="text-[22px] font-semibold">{copy.session.completeTitle}</h1>
      <p className="text-[15px] leading-[22px]">{copy.session.thankYouSharing} {row.seekerName}.</p>
      <Link href={`/phone/${personaId}/opportunities/retiree`} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-rich-blue text-[15px] font-semibold text-white">{copy.session.backDashboard}</Link>
    </div>
  );
}
