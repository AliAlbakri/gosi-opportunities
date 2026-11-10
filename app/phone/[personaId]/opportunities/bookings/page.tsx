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
import { activePhase, formatRemain, getSessionPhase } from "@/lib/domain/sessionPhase";
import { formatWhen, TZ } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";
import { copy } from "@/lib/copy";
import { admin } from "@/lib/supabase/admin";

export default async function BookingsPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const appNow = await getAppNow();
  const rows = await decorateBookings(await bookingsForPerson(user.person.id));
  const youId = user.person.id;
  const phaseOf = (row: (typeof rows)[number]) => getSessionPhase(
    { status: row.status, startsAt: row.starts_at, endsAt: row.ends_at, seekerId: row.seeker_id, retireeId: row.retiree_id, youId },
    [],
    appNow,
  );
  const upcoming = rows
    .filter((row) => (row.status === "pending_payment" && new Date(row.starts_at) >= appNow) || (row.status === "confirmed" && activePhase(phaseOf(row).phase)))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = rows.filter((row) => !upcoming.includes(row));
  const seeker = !user.person.is_retiree;
  const ids = upcoming.map((row) => row.id);
  const { data: eventRows } = ids.length
    ? await admin().from("session_events").select("booking_id, person_id, event, at").in("booking_id", ids)
    : { data: [] as { booking_id: string; person_id: string; event: "joined" | "left"; at: string }[] };
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
            const events = (eventRows ?? []).filter((event) => event.booking_id === row.id).map((event) => ({ personId: event.person_id, event: event.event as "joined" | "left", at: event.at }));
            const phase = getSessionPhase(
              { status: row.status, startsAt: row.starts_at, endsAt: row.ends_at, seekerId: row.seeker_id, retireeId: row.retiree_id, youId },
              events,
              appNow,
            );
            const live = phase.join === "now" || phase.join === "rejoin";
            const locked = phase.phase === "soon"
              ? `${copy.session.joinIn} ${formatRemain(phase.opensAt.getTime() - appNow.getTime())}`
              : `${copy.session.joinAt} ${formatInTimeZone(phase.opensAt, TZ, "HH:mm")}`;
            return (
              <article key={row.id} className="rounded-[20px] bg-white p-4">
                <Link href={`/phone/${personaId}/opportunities/bookings/${row.id}`}>
                  <p className="font-semibold">{row.seekerName}</p>
                  <p className="text-[13px] text-gosi-midnight-50">{formatWhen(row.starts_at)}</p>
                  <p className="text-[13px]">{row.serviceShort}</p>
                  <p className="mt-1 text-[15px]">{row.seeker_need}</p>
                  {live && <p className="mt-1 text-[13px] font-semibold">{phase.otherInCall ? `${row.seekerName} ${copy.session.waiting}` : `${row.seekerName} ${copy.session.notJoined}`}</p>}
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {live ? (
                    <Link className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#14804A]" href={`/phone/${personaId}/opportunities/bookings/${row.id}/lobby`}>
                      <span className="relative inline-flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gosi-vivid-green opacity-70" /><span className="relative h-2.5 w-2.5 rounded-full bg-gosi-vivid-green" /></span>
                      {phase.join === "rejoin" ? copy.session.rejoin : copy.session.joinNow}
                    </Link>
                  ) : phase.join === "locked" ? <span className="text-[13px] font-semibold text-gosi-midnight-50">{locked}</span> : null}
                  {phase.cancel !== "none" && <CancelButton bookingId={row.id} personId={user.person.id} personaId={personaId} party="retiree" late={phase.cancel === "late"} paid={row.is_paid} note={copy.session.recorded} />}
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
