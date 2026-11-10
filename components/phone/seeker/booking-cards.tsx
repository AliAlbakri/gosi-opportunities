import Link from "next/link";
import { Star } from "lucide-react";
import { BookingIllustration } from "@/components/illustrations/spots";
import { Avatar, DateBlock, StatusPill } from "@/components/phone/ui/bits";
import { copy } from "@/lib/copy";
import { formatRemain, getSessionPhase } from "@/lib/domain/sessionPhase";
import { formatClock, formatDay, formatMonth, relativeTo, TZ } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";
import type { Booking } from "@/lib/types";

export type SeekerBooking = Booking & {
  retireeName: string;
  serviceShort: string;
  serviceName: string;
  rated: boolean;
  rating: number | null;
};

function statusOf(row: SeekerBooking) {
  if (row.status === "completed") return { label: copy.seekerUi.completed, tone: "Completed" };
  if (row.status === "cancelled") {
    const who = row.cancelled_by === "seeker" ? copy.seekerUi.byYou : row.cancelled_by === "retiree" ? copy.seekerUi.byRetiree : "";
    return { label: who ? `${copy.seekerUi.cancelled} · ${who}` : copy.seekerUi.cancelled, tone: "Cancelled" };
  }
  if (row.status === "no_show_seeker") return { label: copy.seekerUi.youMissed, tone: "Missed" };
  if (row.status === "no_show_retiree") return { label: copy.seekerUi.retireeMissed, tone: "Missed" };
  return { label: copy.seekerUi.confirmed, tone: "Confirmed" };
}

export function UpcomingList({ rows, personaId, appNow }: { rows: SeekerBooking[]; personaId: string; appNow: Date }) {
  const base = `/phone/${personaId}/opportunities`;
  if (!rows.length) {
    return (
      <div className="rounded-[20px] bg-white px-4 py-8 text-center">
        <BookingIllustration className="mx-auto h-24 w-32" />
        <p className="mt-3 text-lg font-semibold">{copy.seekerUi.noUpcoming}</p>
        <p className="mt-1 text-[15px] text-gosi-midnight-50">{copy.seekerUi.noUpcomingBody}</p>
        <Link href={base} className="mt-4 inline-flex h-11 items-center text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.browseRetirees}</Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const start = new Date(row.starts_at).getTime();
        const soon = index === 0 && start - appNow.getTime() < 24 * 60 * 60 * 1000 && start >= appNow.getTime();
        const phase = getSessionPhase(
          { status: row.status, startsAt: row.starts_at, endsAt: row.ends_at, seekerId: row.seeker_id, retireeId: row.retiree_id, youId: row.seeker_id },
          [],
          appNow,
        );
        const live = phase.join === "now" || phase.join === "rejoin";
        const locked = phase.phase === "soon"
          ? `${copy.session.joinIn} ${formatRemain(phase.opensAt.getTime() - appNow.getTime())}`
          : `${copy.session.joinAt} ${formatInTimeZone(phase.opensAt, TZ, "HH:mm")}`;
        const state = statusOf(row);
        return (
          <article key={row.id} className={`rounded-[20px] bg-white ${soon ? "p-4" : "p-3"}`}>
            {soon && <p className="mb-2 text-[13px] font-semibold text-[#14804A]">{copy.seekerUi.nextUp}</p>}
            <div className="flex gap-3">
              <DateBlock date={row.starts_at} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Avatar name={row.retireeName} size={32} verified />
                  <p className="truncate text-[15px] font-semibold">{row.retireeName}</p>
                </div>
                <p className="mt-1 truncate text-[13px] text-gosi-midnight-50">{row.serviceShort}</p>
                <p className={`mt-1 text-[13px] font-semibold ${soon ? "text-[#14804A]" : ""}`}>{formatClock(row.starts_at)} – {formatClock(row.ends_at)} · {relativeTo(row.starts_at, appNow)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone={state.tone}>{state.label}</StatusPill>
                  {row.is_paid && <StatusPill tone="Paid">{`SAR ${Math.round(Number(row.price ?? 0))}`}</StatusPill>}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {live ? (
                <Link href={`${base}/bookings/${row.id}/lobby`} className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-gosi-vivid-green px-4 text-[15px] font-semibold text-gosi-rich-blue">
                  <span className="relative inline-flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gosi-rich-blue opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-gosi-rich-blue" /></span>
                  {phase.join === "rejoin" ? copy.session.rejoin : copy.session.joinNow}
                </Link>
              ) : (
                <span className="inline-flex h-[52px] flex-1 items-center justify-center rounded-full bg-gosi-midnight-25 px-3 text-center text-[13px] font-semibold text-gosi-midnight-50">{locked}</span>
              )}
              <Link href={`${base}/bookings/${row.id}`} className="px-2 text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.details}</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PastList({ rows, personaId }: { rows: SeekerBooking[]; personaId: string }) {
  const base = `/phone/${personaId}/opportunities`;
  if (!rows.length) return <p className="text-[15px] text-gosi-midnight-50">{copy.seekerUi.pastEmpty}</p>;
  const sorted = [...rows].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  const groups: { month: string; rows: SeekerBooking[] }[] = [];
  for (const row of sorted) {
    const month = formatMonth(row.starts_at);
    const group = groups.find((item) => item.month === month);
    if (group) group.rows.push(row);
    else groups.push({ month, rows: [row] });
  }
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.month} className="space-y-3">
          <h2 className="text-[15px] font-semibold">{group.month}</h2>
          {group.rows.map((row) => {
            const state = statusOf(row);
            return (
              <article key={row.id} className="rounded-[20px] bg-white p-3">
                <Link href={`${base}/bookings/${row.id}`} className="flex gap-3">
                  <Avatar name={row.retireeName} size={40} verified />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{row.retireeName}</span>
                    <span className="block truncate text-[13px] text-gosi-midnight-50">{row.serviceShort}</span>
                    <span className="mt-1 block text-[13px]">{formatDay(row.starts_at)} · {formatClock(row.starts_at)}</span>
                    <span className="mt-2 block"><StatusPill tone={state.tone}>{state.label}</StatusPill></span>
                  </span>
                </Link>
                <div className="mt-3">
                  {row.status === "completed" && !row.rated && <Link href={`${base}/bookings/${row.id}/feedback`} className="text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.rate}</Link>}
                  {row.status === "completed" && row.rated && (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#00BF00]"><Star size={14} fill="#00BF00" strokeWidth={0} />{row.rating?.toFixed(1)}</span>
                      <Link href={`${base}/p/${row.retiree_id}`} className="text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.bookAgain}</Link>
                    </div>
                  )}
                  {row.status !== "completed" && <Link href={`${base}/p/${row.retiree_id}`} className="text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.bookAgain}</Link>}
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
