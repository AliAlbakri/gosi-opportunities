import Link from "next/link";
import type { ReactNode } from "react";
import { Calendar, Camera, Clock, Info, MessageCircle, SunMedium, Timer, Video, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { CancelButton } from "@/components/phone/cancel-button";
import { AddToCalendar } from "@/components/phone/seeker/add-calendar";
import { DeviceReady } from "@/components/phone/session/device-ready";
import { StatusCard } from "@/components/phone/session/status-card";
import { AppHeader } from "@/components/phone/ui/header";
import { Avatar } from "@/components/phone/ui/bits";
import { StickyFooter } from "@/components/phone/ui/buttons";
import { getBooking } from "@/lib/domain/bookings";
import { getAppNow, getClockOffset } from "@/lib/domain/clock";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { eventsForBooking, phaseFor } from "@/lib/domain/sessions";
import { money, TZ } from "@/lib/format";
import { copy } from "@/lib/copy";
import { admin } from "@/lib/supabase/admin";

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gosi-midnight-50">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-gosi-midnight-50">{label}</span>
        <span className="block text-[15px] font-semibold">{value}</span>
      </span>
    </div>
  );
}

export default async function BookingPage({ params }: { params: Promise<{ personaId: string; bookingId: string }> }) {
  const { personaId, bookingId } = await params;
  const user = await requireUser(personaId);
  const booking = await getBooking(bookingId);
  if (!user || !booking) notFound();
  if (booking.seeker_id !== user.person.id && booking.retiree_id !== user.person.id) notFound();
  const [row] = await decorateBookings([booking]);
  const [appNow, offset, events, profile] = await Promise.all([
    getAppNow(),
    getClockOffset(),
    eventsForBooking(bookingId),
    admin().from("retiree_profiles").select("discipline_role").eq("person_id", booking.retiree_id).maybeSingle(),
  ]);
  const party = booking.seeker_id === user.person.id ? "seeker" : "retiree";
  const phase = phaseFor(booking, events, user.person.id, appNow);
  const base = `/phone/${personaId}/opportunities`;
  const otherFirst = party === "seeker" ? row.retireeFirst : row.seekerName;
  const preparing = phase.phase === "upcoming" || phase.phase === "soon" || phase.phase === "open";
  const price = booking.is_paid ? money(booking.price) : "Free";
  const role = (profile.data?.discipline_role as string | undefined)?.trim() || row.serviceShort;
  const canReport = party === "seeker" && (booking.status === "completed" || booking.status === "no_show_retiree");
  const next = booking.status === "completed" && party === "seeker" && !row.rated
    ? { href: `${base}/bookings/${bookingId}/feedback`, label: copy.seekerUi.rate }
    : canReport && booking.status === "no_show_retiree"
      ? { href: `${base}/bookings/${bookingId}/report`, label: copy.seekerUi.report }
      : party === "seeker" && (phase.phase === "completed" || phase.phase === "cancelled" || phase.phase === "missed" || phase.phase === "closed")
        ? { href: `${base}/p/${booking.retiree_id}`, label: copy.seekerUi.bookAgain }
        : party === "retiree" && (phase.phase === "completed" || phase.phase === "cancelled" || phase.phase === "missed" || phase.phase === "closed")
          ? { href: `${base}/retiree`, label: copy.session.backDashboard }
          : null;
  return (
    <div className="flex min-h-full flex-col text-gosi-rich-blue">
      <AppHeader
        title={copy.session.yourSession}
        action={<AddToCalendar icon start={booking.starts_at} end={booking.ends_at} title={`${row.serviceShort} with ${otherFirst}`} />}
      />
      <div className="space-y-4 px-5 py-4 pb-8">
        <StatusCard
          offset={offset}
          startsAt={booking.starts_at}
          endsAt={booking.ends_at}
          status={booking.status}
          seekerId={booking.seeker_id}
          retireeId={booking.retiree_id}
          youId={user.person.id}
          events={events}
          otherName={otherFirst}
          lobbyHref={`${base}/bookings/${bookingId}/lobby`}
          next={next}
        />
        {party === "seeker" ? (
          <Link href={`${base}/p/${booking.retiree_id}`} className="flex items-center gap-3 rounded-[20px] bg-white p-4">
            <Avatar name={row.retireeName} size={56} verified />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{row.retireeName}</span>
              <span className="block truncate text-[13px] text-gosi-midnight-50">{role}</span>
              <span className="text-[13px] font-semibold text-gosi-blue">{copy.seekerUi.viewProfile} ›</span>
            </span>
          </Link>
        ) : (
          <div className="rounded-[20px] bg-white p-4">
            <p className="text-[13px] font-semibold text-gosi-midnight-50">{copy.session.prepare} {row.seekerName}</p>
            <p className="mt-1 text-[15px] font-semibold">{row.serviceShort}</p>
            <blockquote className="mt-3 border-l-2 border-gosi-blue pl-3">
              <p className="text-[13px] font-semibold">{copy.session.whatYouNeed}</p>
              <p className="text-[15px]">{booking.seeker_need}</p>
            </blockquote>
            <blockquote className="mt-3 border-l-2 border-gosi-blue pl-3">
              <p className="text-[13px] font-semibold">{copy.session.whatYouWant}</p>
              <p className="text-[15px]">{booking.seeker_goal}</p>
            </blockquote>
          </div>
        )}
        <div className="rounded-[20px] bg-white px-4 py-2">
          <Row icon={<Video size={18} />} label={copy.session.service} value={row.serviceShort} />
          <Row icon={<Calendar size={18} />} label={copy.session.date} value={formatInTimeZone(booking.starts_at, TZ, "EEE d MMM")} />
          <Row icon={<Clock size={18} />} label={copy.session.time} value={`${formatInTimeZone(booking.starts_at, TZ, "HH:mm")} – ${formatInTimeZone(booking.ends_at, TZ, "HH:mm")} (${copy.session.riyadh})`} />
          <Row icon={<Timer size={18} />} label={copy.session.duration} value={copy.seekerUi.oneHour} />
          <Row icon={<Wallet size={18} />} label={copy.session.price} value={price} />
          <Row icon={<Video size={18} />} label={copy.session.how} value={copy.session.howVideo} />
        </div>
        {preparing && (
          <div className="rounded-[20px] bg-white p-4">
            <p className="font-semibold">{copy.session.getReady}</p>
            <ul className="mt-3 space-y-3 text-[15px]">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2"><Camera size={18} />{copy.session.testDevices}</span>
                <DeviceReady personaId={personaId} href={`${base}/devices`} />
              </li>
              <li className="flex items-center gap-2"><SunMedium size={18} />{copy.session.quietPlace}</li>
              <li className="flex items-center gap-2"><MessageCircle size={18} />{copy.session.questionsReady}</li>
            </ul>
          </div>
        )}
        {party === "seeker" && (
          <div className="rounded-[20px] bg-white p-4">
            <p className="font-semibold">{copy.seekerUi.yourNotes}</p>
            <p className="mt-2 text-[13px] font-semibold">{copy.session.whatYouNeed}</p>
            <p className="text-[15px]">{booking.seeker_need}</p>
            <p className="mt-2 text-[13px] font-semibold">{copy.session.whatYouWant}</p>
            <p className="text-[15px]">{booking.seeker_goal}</p>
          </div>
        )}
        {preparing && (
          <div className="rounded-[20px] bg-white p-4 text-[15px] leading-[22px]">
            <p className="font-semibold">{copy.session.goodToKnow}</p>
            <ul className="mt-2 space-y-1 text-gosi-midnight-80">
              <li>{copy.session.opensTen}</li>
              <li>{copy.session.shareScreen}</li>
              <li>{copy.session.notRecorded}</li>
              {party === "retiree" ? (
                <>
                  <li>{copy.session.leavingFor} {row.seekerName}.</li>
                  <li>{copy.session.cancelRecorded}.</li>
                </>
              ) : (
                <li>{copy.session.freeCancel}</li>
              )}
            </ul>
            <p className="mt-3 flex gap-2 text-[13px] text-gosi-midnight-50"><Info size={16} className="mt-0.5 shrink-0" />{copy.disclaimer}</p>
          </div>
        )}
        {booking.status === "pending_payment" && <Link className="text-[15px] font-semibold text-gosi-blue" href={`${base}/bookings/${bookingId}/pay`}>Continue to payment</Link>}
        {canReport && booking.status === "completed" && <Link className="text-[15px] font-semibold text-gosi-blue" href={`${base}/bookings/${bookingId}/report`}>{copy.seekerUi.report}</Link>}
      </div>
      {phase.cancel !== "none" && (
        <StickyFooter>
          <div className="flex justify-center">
            <CancelButton
              bookingId={bookingId}
              personId={user.person.id}
              personaId={personaId}
              party={party}
              late={phase.cancel === "late"}
              paid={booking.is_paid}
              variant="text"
              note={party === "retiree" ? copy.session.recorded : undefined}
            />
          </div>
        </StickyFooter>
      )}
    </div>
  );
}
