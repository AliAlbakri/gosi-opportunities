import Link from "next/link";
import { Camera, Clock, VolumeX } from "lucide-react";
import { notFound } from "next/navigation";
import { formatDistance } from "date-fns";
import { CancelButton } from "@/components/phone/cancel-button";
import { AddToCalendar } from "@/components/phone/seeker/add-calendar";
import { AppHeader } from "@/components/phone/ui/header";
import { Avatar, DateBlock, StatusPill } from "@/components/phone/ui/bits";
import { StickyFooter } from "@/components/phone/ui/buttons";
import { Timeline } from "@/components/phone/ui/flow";
import { getBooking } from "@/lib/domain/bookings";
import { getAppNow } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { formatClock, money } from "@/lib/format";
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
  const end = new Date(booking.ends_at).getTime();
  const party = booking.seeker_id === user.person.id ? "seeker" : "retiree";
  const base = `/phone/${personaId}/opportunities`;
  const canJoin = booking.status === "confirmed" && appNow.getTime() >= start - 10 * 60 * 1000 && appNow.getTime() <= end + 30 * 60 * 1000;
  const canCancel = (booking.status === "confirmed" || booking.status === "pending_payment") && start > appNow.getTime();
  const upcoming = canCancel || (booking.status === "confirmed" && appNow.getTime() <= end);
  const state = booking.status === "completed" ? "Completed" : booking.status === "cancelled" ? "Cancelled" : booking.status.startsWith("no_show") ? "Missed" : "Confirmed";
  const label = state === "Missed" ? (booking.status === "no_show_seeker" ? copy.seekerUi.youMissed : copy.seekerUi.retireeMissed) : state === "Cancelled" ? copy.seekerUi.cancelled : state === "Completed" ? copy.seekerUi.completed : copy.seekerUi.confirmed;
  const canReport = party === "seeker" && (booking.status === "completed" || booking.status === "no_show_retiree");
  const reportSoon = booking.is_paid && appNow.getTime() <= end + 48 * 60 * 60 * 1000;

  if (party === "retiree") {
    return (
      <div className="pb-8 text-gosi-rich-blue">
        <AppHeader title={row.serviceName} />
        <div className="space-y-3 px-5 py-4">
          <p className="font-semibold">{row.seekerName}</p>
          <p>{formatClock(booking.starts_at)} – {formatClock(booking.ends_at)}</p>
          <p>Need: {booking.seeker_need}</p>
          <p>Goal: {booking.seeker_goal}</p>
          {canJoin && <Link className="inline-flex h-[52px] items-center rounded-full bg-gosi-vivid-green px-6 font-semibold" href={`${base}/bookings/${bookingId}/call`}>{copy.join}</Link>}
          {canCancel && <CancelButton bookingId={bookingId} personId={user.person.id} personaId={personaId} party="retiree" late={start - appNow.getTime() < 3 * 60 * 60 * 1000} paid={booking.is_paid} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col text-gosi-rich-blue">
      <AppHeader title={row.serviceShort} />
      <div className="space-y-4 px-5 py-4 pb-8">
        <div className="rounded-[20px] bg-white p-4">
          <Link href={`${base}/p/${booking.retiree_id}`} className="flex items-center gap-3">
            <Avatar name={row.retireeName} size={56} verified />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{row.retireeName}</span>
              <span className="text-[13px] font-semibold text-gosi-blue">{copy.seekerUi.viewProfile} ›</span>
            </span>
          </Link>
          <p className="mt-3 text-[15px] font-semibold">{row.serviceName}</p>
          <div className="mt-3 flex gap-3">
            <DateBlock date={booking.starts_at} />
            <div>
              <p className="text-[15px] font-semibold">{formatClock(booking.starts_at)} – {formatClock(booking.ends_at)}</p>
              <p className="text-[13px] text-gosi-midnight-50">{copy.seekerUi.oneHour}</p>
              <p className="mt-1 text-[15px] font-semibold">{booking.is_paid ? money(booking.price) : "Free"}</p>
              <div className="mt-2"><StatusPill tone={state}>{label}</StatusPill></div>
            </div>
          </div>
          {upcoming && start > appNow.getTime() && <p className="mt-3 text-[15px] font-semibold">{copy.seekerUi.startsIn} {formatDistance(new Date(booking.starts_at), appNow)}</p>}
        </div>
        {upcoming && (
          <div className="rounded-[20px] bg-white p-4">
            <p className="font-semibold">{copy.seekerUi.before}</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li className="flex items-center gap-2"><VolumeX size={18} strokeWidth={1.75} />{copy.seekerUi.tipQuiet}</li>
              <li className="flex items-center gap-2"><Camera size={18} strokeWidth={1.75} />{copy.seekerUi.tipCamera}</li>
              <li className="flex items-center gap-2"><Clock size={18} strokeWidth={1.75} />{copy.seekerUi.tipEarly}</li>
            </ul>
            <div className="mt-3">
              <AddToCalendar start={booking.starts_at} end={booking.ends_at} title={`${row.serviceShort} with ${row.retireeName}`} />
            </div>
          </div>
        )}
        <div className="rounded-[20px] bg-white p-4">
          <p className="font-semibold">{copy.seekerUi.yourNotes}</p>
          <p className="mt-2 text-[15px]">{booking.seeker_need}</p>
          <p className="mt-1 text-[15px] text-gosi-midnight-50">{booking.seeker_goal}</p>
        </div>
        <Timeline items={[
          { title: copy.seekerUi.booked, state: "done" },
          { title: copy.seekerUi.reminder, state: booking.reminders_sent?.length ? "done" : "upcoming" },
          { title: copy.seekerUi.sessionStep, state: end <= appNow.getTime() ? "done" : start - appNow.getTime() < 60 * 60 * 1000 ? "current" : "upcoming" },
          { title: copy.seekerUi.feedbackStep, state: row.rated ? "done" : booking.status === "completed" ? "current" : "upcoming" },
        ]} />
        {booking.status === "pending_payment" && <Link className="text-[15px] font-semibold text-gosi-blue" href={`${base}/bookings/${bookingId}/pay`}>Continue to payment</Link>}
        {booking.status === "completed" && !row.rated && <Link className="text-[15px] font-semibold text-gosi-blue" href={`${base}/bookings/${bookingId}/feedback`}>{copy.seekerUi.rate}</Link>}
      </div>
      <StickyFooter>
        <div className="flex flex-col items-center gap-2">
          {upcoming && (canJoin ? (
            <Link href={`${base}/bookings/${bookingId}/call`} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-vivid-green text-[15px] font-semibold">{copy.join}</Link>
          ) : (
            <span className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-midnight-25 text-[13px] font-semibold text-gosi-midnight-50">{copy.seekerUi.opens}</span>
          ))}
          {canCancel && <CancelButton bookingId={bookingId} personId={user.person.id} personaId={personaId} party="seeker" late={start - appNow.getTime() < 3 * 60 * 60 * 1000} paid={booking.is_paid} variant="text" />}
          {!upcoming && <Link href={`${base}/p/${booking.retiree_id}`} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-vivid-green text-[15px] font-semibold">{copy.seekerUi.bookAgain}</Link>}
          {canReport && <Link href={`${base}/bookings/${bookingId}/report`} className={`text-[15px] font-semibold text-gosi-blue ${reportSoon ? "underline" : ""}`}>{copy.seekerUi.report}</Link>}
          {canReport && booking.is_paid && reportSoon && <p className="text-center text-[13px] text-gosi-midnight-50">{copy.seekerUi.reportHold}</p>}
        </div>
      </StickyFooter>
    </div>
  );
}
