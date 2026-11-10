import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelButton } from "@/components/phone/cancel-button";
import { PastList, UpcomingList, type SeekerBooking } from "@/components/phone/seeker/booking-cards";
import { BookingTabs } from "@/components/phone/seeker/booking-tabs";
import { AppHeader } from "@/components/phone/ui/header";
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
  const upcoming = rows
    .filter((row) => ["confirmed", "pending_payment"].includes(row.status) && new Date(row.starts_at) >= appNow)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = rows.filter((row) => !upcoming.includes(row));
  const seeker = !user.person.is_retiree;
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <AppHeader title="My bookings" />
      {seeker ? (
        <BookingTabs
          upcomingCount={upcoming.length}
          pastCount={past.length}
          upcoming={<UpcomingList rows={upcoming as SeekerBooking[]} personaId={personaId} appNow={appNow} />}
          past={<PastList rows={past as SeekerBooking[]} personaId={personaId} />}
        />
      ) : (
        <div className="space-y-3 px-5 py-4">
          <h2 className="text-lg font-semibold">{copy.seekerUi.upcoming}</h2>
          {upcoming.map((row) => {
            const start = new Date(row.starts_at).getTime();
            const canJoin = row.status === "confirmed" && appNow.getTime() >= start - 10 * 60 * 1000 && appNow.getTime() <= new Date(row.ends_at).getTime() + 30 * 60 * 1000;
            const canCancel = start > appNow.getTime();
            return (
              <article key={row.id} className="rounded-[20px] bg-white p-4">
                <Link href={`/phone/${personaId}/opportunities/bookings/${row.id}`}>
                  <p className="font-semibold">{row.seekerName}</p>
                  <p className="text-[13px] text-gosi-midnight-50">{formatWhen(row.starts_at)}</p>
                  <p className="text-[13px]">{row.serviceShort}</p>
                  <p className="mt-1 text-[15px]">{row.seeker_need}</p>
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {canJoin && <Link className="text-[15px] font-semibold text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings/${row.id}/call`}>{copy.join}</Link>}
                  {canCancel && <CancelButton bookingId={row.id} personId={user.person.id} personaId={personaId} party="retiree" late={start - appNow.getTime() < 3 * 60 * 60 * 1000} paid={row.is_paid} />}
                </div>
              </article>
            );
          })}
          {!upcoming.length && <p className="text-[15px] text-gosi-midnight-50">{copy.seekerUi.noUpcoming}</p>}
          <h2 className="text-lg font-semibold">{copy.seekerUi.past}</h2>
          {past.map((row) => (
            <article key={row.id} className="rounded-[20px] bg-white p-4">
              <Link href={`/phone/${personaId}/opportunities/bookings/${row.id}`}>
                <p className="font-semibold">{row.seekerName}</p>
                <p className="text-[13px] text-gosi-midnight-50">{formatWhen(row.starts_at)}</p>
                <p className="text-[13px]">{row.serviceShort}</p>
                <p className="mt-1 text-[15px]">{row.seeker_need}</p>
              </Link>
            </article>
          ))}
          {!past.length && <p className="text-[15px] text-gosi-midnight-50">{copy.seekerUi.pastEmpty}</p>}
        </div>
      )}
    </div>
  );
}
