import { notFound } from "next/navigation";
import { Lobby } from "@/components/phone/session/lobby";
import { getBooking } from "@/lib/domain/bookings";
import { getClockOffset } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { eventsForBooking } from "@/lib/domain/sessions";

export default async function LobbyPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking) notFound();
  if (booking.seeker_id !== user.person.id && booking.retiree_id !== user.person.id) notFound();
  const [row] = await decorateBookings([booking]);
  const [offset, events] = await Promise.all([getClockOffset(), eventsForBooking(bookingId)]);
  const party = booking.seeker_id === user.person.id ? "seeker" : "retiree";
  return (
        <Lobby
      personaId={personaId}
      bookingId={bookingId}
      firstName={user.person.first_name}
      otherName={party === "seeker" ? row.retireeFirst : row.seekerName}
      serviceShort={row.serviceShort}
      offset={offset}
      startsAt={booking.starts_at}
      endsAt={booking.ends_at}
      status={booking.status}
      seekerId={booking.seeker_id}
      retireeId={booking.retiree_id}
      youId={user.person.id}
      events={events}
    />
  );
}
