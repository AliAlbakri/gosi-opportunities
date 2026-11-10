"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { formatRemain, getSessionPhase, startsInLabel, type SessionEvent } from "@/lib/domain/sessionPhase";
import { TZ } from "@/lib/format";
import { copy } from "@/lib/copy";
import { useAppOffset } from "@/lib/realtime-client";

export function StatusCard({
  offset,
  startsAt,
  endsAt,
  status,
  seekerId,
  retireeId,
  youId,
  events,
  otherName,
  lobbyHref,
  next,
}: {
  offset: number;
  startsAt: string;
  endsAt: string;
  status: string;
  seekerId: string;
  retireeId: string;
  youId: string;
  events: SessionEvent[];
  otherName: string;
  lobbyHref: string;
  next: { href: string; label: string } | null;
}) {
  const liveOffset = useAppOffset(offset);
  const [now, setNow] = useState(() => Date.now() + offset * 1000);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + liveOffset * 1000), 1000);
    setNow(Date.now() + liveOffset * 1000);
    return () => clearInterval(timer);
  }, [liveOffset]);
  const phase = getSessionPhase({ status, startsAt, endsAt, seekerId, retireeId, youId }, events, new Date(now));
  const startLabel = `${formatInTimeZone(startsAt, TZ, "EEE d MMM")} · ${formatInTimeZone(startsAt, TZ, "HH:mm")} – ${formatInTimeZone(endsAt, TZ, "HH:mm")}`;
  const untilStart = new Date(startsAt).getTime() - now;
  const startsLabel = `${copy.session.startsIn} ${startsInLabel(untilStart)}`;
  const headline = phase.phase === "open" || phase.phase === "live"
    ? copy.session.sessionOpen
    : phase.phase === "overtime"
      ? copy.session.inProgress
      : phase.phase === "missed"
        ? copy.session.missedTitle
        : phase.phase === "cancelled"
          ? copy.session.cancelledTitle
          : phase.phase === "completed"
            ? copy.session.completeTitle
            : phase.phase === "closed"
              ? copy.session.sessionEnded
              : startsLabel;
  const live = phase.phase === "open" || phase.phase === "live" || phase.phase === "overtime";
  const locked = phase.join === "locked";
  const tone = live ? "bg-gosi-vivid-green text-gosi-rich-blue" : locked || phase.phase === "upcoming" || phase.phase === "soon" ? "bg-gosi-rich-blue text-white" : "bg-white text-gosi-rich-blue";
  const joinLabel = phase.join === "rejoin"
    ? copy.session.rejoin
    : phase.phase === "soon"
      ? `${copy.session.joinIn} ${formatRemain(phase.opensAt.getTime() - now)}`
      : `${copy.session.joinAt} ${formatInTimeZone(phase.opensAt, TZ, "HH:mm")}`;
  return (
    <section className={`rounded-[20px] p-4 ${tone}`}>
      <p className="text-[22px] font-semibold leading-7">{headline}</p>
      <p className={`mt-1 text-[15px] ${live ? "" : locked ? "text-white/80" : "text-gosi-midnight-50"}`}>{startLabel}</p>
      {live && (
        <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold">
          <span className={`h-2.5 w-2.5 rounded-full ${phase.otherInCall ? "bg-gosi-vivid-green ring-2 ring-gosi-rich-blue" : "bg-gosi-rich-blue/30"}`} />
          {phase.otherInCall ? `${otherName} ${copy.session.waiting}` : `${otherName} ${copy.session.notJoined}`}
        </p>
      )}
      {live && (
        <Link href={lobbyHref} className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gosi-rich-blue text-[15px] font-semibold text-white">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gosi-vivid-green opacity-75" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-gosi-vivid-green" />
          </span>
          {phase.join === "rejoin" ? copy.session.rejoin : copy.session.joinNow}
        </Link>
      )}
      {locked && (
        <>
          <p className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white/20 text-[15px] font-semibold">
            <Lock size={16} />{joinLabel}
          </p>
          <p className="mt-2 text-center text-[13px] text-white/80">{copy.session.notifyWhenOpen}</p>
        </>
      )}
      {!live && !locked && next && (
        <Link href={next.href} className="mt-4 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-rich-blue text-[15px] font-semibold text-white">{next.label}</Link>
      )}
    </section>
  );
}
