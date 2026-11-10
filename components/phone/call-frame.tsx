"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { joinAction } from "@/app/actions/flow";
import { BottomSheet } from "@/components/phone/ui/flow";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { formatClock } from "@/lib/format";
import { copy } from "@/lib/copy";
import { useAppOffset } from "@/lib/realtime-client";

const theme = {
  colors: {
    accent: "#00BF00",
    accentText: "#00004E",
    background: "#00122D",
    backgroundAccent: "#00004E",
    baseText: "#FFFFFF",
    border: "#333371",
    mainAreaBg: "#00122D",
    mainAreaBgAccent: "#00004E",
    mainAreaText: "#FFFFFF",
    supportiveText: "#BFC4CB",
  },
};

export function CallFrame({
  bookingId,
  personId,
  personaId,
  name,
  otherName,
  offset,
  serviceName,
  startsAt,
  endsAt,
  role,
}: {
  bookingId: string;
  personId: string;
  personaId: string;
  name: string;
  otherName: string;
  offset: number;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  role: "seeker" | "retiree";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callRef = useRef<{ leave: () => void; destroy: () => void } | null>(null);
  const leaving = useRef(false);
  const liveOffset = useAppOffset(offset);
  const offsetRef = useRef(liveOffset);
  offsetRef.current = liveOffset;
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [late, setLate] = useState(false);
  const [banner, setBanner] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const until = formatClock(new Date(new Date(endsAt).getTime() + 30 * 60 * 1000).toISOString());
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    let postedLeft = false;
    (async () => {
      const cachedRaw = sessionStorage.getItem(`gosi-call:${bookingId}`);
      sessionStorage.removeItem(`gosi-call:${bookingId}`);
      const cached = cachedRaw ? JSON.parse(cachedRaw) as { url: string; hasNext: boolean; endsAt: string } : null;
      const result = cached ? { ok: true as const, url: cached.url, hasNext: cached.hasNext, endsAt: cached.endsAt } : await joinAction(bookingId, personId, name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.hasNext) setHasNext(true);
      const Daily = (await import("@daily-co/daily-js")).default;
      if (cancelled || !ref.current) return;
      const call = Daily.createFrame(ref.current, {
        iframeStyle: { width: "100%", height: "100%", border: "0" },
        showLeaveButton: false,
        showFullscreenButton: false,
        showLocalVideo: true,
        showParticipantsBar: false,
        theme,
      });
      callRef.current = call;
      const post = (event: "joined" | "left") => {
        if (event === "left" && postedLeft) return;
        if (event === "left") postedLeft = true;
        void fetch(`/api/sessions/${bookingId}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId, event }),
        });
      };
      call.on("joined-meeting", () => post("joined"));
      call.on("left-meeting", () => {
        if (cancelled || !leaving.current) return;
        post("left");
        router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}/left`);
      });
      try {
        await call.join({ url: result.url });
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : copy.session.network);
        return;
      }
      if (cancelled) return;
      const tick = () => {
        const appNow = Date.now() + offsetRef.current * 1000;
        const seconds = Math.max(0, Math.floor((appNow - new Date(startsAt).getTime()) / 1000));
        setElapsed(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`);
        setLate(seconds >= 55 * 60 && seconds < 60 * 60);
        if (appNow >= new Date(endsAt).getTime()) setBanner(true);
      };
      tick();
      timer = setInterval(tick, 1000);
    })();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      callRef.current?.destroy();
      callRef.current = null;
    };
  }, [bookingId, endsAt, name, personId, personaId, router, startsAt]);
  return (
    <div className="relative h-full min-h-[640px] bg-[#00122D] text-white">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-[#00122D]/90 px-3 py-2 text-[13px]">
        <p className="min-w-0 flex-1 truncate font-semibold">{serviceName}</p>
        <p className="tabular-nums">{elapsed}</p>
        <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${late ? "bg-amber-500 text-[#00122D]" : "bg-white/15"}`}>{copy.session.hourPill}</span>
        <button type="button" className="rounded-full bg-white/15 px-3 py-1 font-semibold" onClick={() => setConfirm(true)}>{copy.session.leave}</button>
      </div>
      {banner && (
        <div className="absolute inset-x-3 top-12 z-20 rounded-2xl bg-white p-3 text-[13px] text-gosi-rich-blue">
          <p>{copy.session.endedBanner}</p>
          {role === "retiree" && hasNext && <p className="mt-1 font-semibold">{copy.session.nextStarts}</p>}
          <button type="button" className="mt-2 font-semibold" onClick={() => setBanner(false)}>OK</button>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center">
          <p>{error}</p>
        </div>
      )}
      <div ref={ref} className="h-full" />
      <BottomSheet title={copy.session.leaveTitle} open={confirm} onClose={() => setConfirm(false)}>
        <div className="space-y-3 text-[15px] leading-[22px]">
          <p>{copy.session.leaveBody} {otherName}. {copy.session.rejoinUntil} {until}.</p>
          <PrimaryButton className="w-full" onClick={() => {
            leaving.current = true;
            callRef.current?.leave();
          }}>{copy.session.leave}</PrimaryButton>
          <button type="button" className="h-11 w-full text-[15px] font-semibold" onClick={() => setConfirm(false)}>{copy.session.stay}</button>
        </div>
      </BottomSheet>
    </div>
  );
}
