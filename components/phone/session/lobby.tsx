"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/phone/ui/bits";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { formatRemain, getSessionPhase, joinOpensLabel, startsInLabel, type SessionEvent } from "@/lib/domain/sessionPhase";
import { copy } from "@/lib/copy";
import { PermissionSheet, useLocalPreview } from "@/components/phone/session/preview";
import { useAppOffset } from "@/lib/realtime-client";

export function Lobby({
  personaId,
  bookingId,
  firstName,
  otherName,
  serviceShort,
  offset,
  startsAt,
  endsAt,
  status,
  seekerId,
  retireeId,
  youId,
  events,
}: {
  personaId: string;
  bookingId: string;
  firstName: string;
  otherName: string;
  serviceShort: string;
  offset: number;
  startsAt: string;
  endsAt: string;
  status: string;
  seekerId: string;
  retireeId: string;
  youId: string;
  events: SessionEvent[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preview = useLocalPreview();
  const router = useRouter();
  const liveOffset = useAppOffset(offset);
  const [now, setNow] = useState(() => Date.now() + offset * 1000);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + liveOffset * 1000), 1000);
    setNow(Date.now() + liveOffset * 1000);
    setMobile(window.matchMedia("(pointer: coarse)").matches);
    return () => clearInterval(timer);
  }, [liveOffset]);
  useEffect(() => {
    if (videoRef.current && preview.stream) videoRef.current.srcObject = preview.stream;
  }, [preview.stream]);
  const phase = getSessionPhase({ status, startsAt, endsAt, seekerId, retireeId, youId }, events, new Date(now));
  const start = new Date(startsAt).getTime();
  const timer = now < start ? `${copy.session.startsIn} ${startsInLabel(start - now)}` : `${copy.session.startedAgo} ${formatRemain(now - start)} ${copy.session.ago}`;
  const open = phase.join === "now" || phase.join === "rejoin";
  async function join() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/sessions/${bookingId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; url?: string; roomUrl?: string; hasNext?: boolean; endsAt?: string } | null;
    setPending(false);
    if (!result?.ok || !result.url && !result?.roomUrl) {
      setError(result?.error || copy.session.network);
      return;
    }
    const url = result.url || result.roomUrl;
    sessionStorage.setItem(`gosi-call:${bookingId}`, JSON.stringify({ url, hasNext: Boolean(result.hasNext), endsAt: result.endsAt }));
    router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}/call`);
  }
  return (
    <div className="flex min-h-full flex-col bg-gosi-midnight-10 px-5 py-4 text-gosi-rich-blue">
      <button type="button" aria-label="Back" className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-white" onClick={() => router.back()}>
        <ChevronLeft size={22} strokeWidth={1.75} />
      </button>
      <p className="text-[15px] font-semibold">{copy.session.with} {otherName} · {serviceShort}</p>
      <p className="mt-1 text-[13px] text-gosi-midnight-50">{timer}</p>
      <div className="relative mx-auto mt-4 aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-[24px] bg-gosi-midnight">
        <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${preview.cameraOn ? "" : "invisible"}`} />
        <p className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-[13px] font-semibold text-white">{firstName}</p>
      </div>
      <div className="mx-auto mt-3 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-gosi-vivid-green" style={{ width: `${Math.round(preview.level * 100)}%` }} />
      </div>
      <div className="mx-auto mt-3 flex w-full max-w-[280px] gap-3">
        <button type="button" aria-label={copy.session.microphone} className={`grid h-11 flex-1 place-items-center rounded-full ${preview.micOn ? "bg-white" : "bg-gosi-midnight-25"}`} onClick={preview.toggleMic}><Mic size={18} /></button>
        <button type="button" aria-label={copy.session.camera} className={`grid h-11 flex-1 place-items-center rounded-full ${preview.cameraOn ? "bg-white" : "bg-gosi-midnight-25"}`} onClick={preview.toggleCamera}><Camera size={18} /></button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[15px]">
        <Avatar name={otherName} size={32} />
        <span className={`h-2.5 w-2.5 rounded-full ${phase.otherInCall ? "bg-gosi-vivid-green" : "bg-gosi-midnight-25"}`} />
        {phase.otherInCall ? `${otherName} ${copy.session.waiting}` : `${otherName} ${copy.session.notJoined}`}
      </p>
      <p className="mt-3 text-[13px] text-gosi-midnight-50">{copy.session.shareScreen}{mobile ? `. ${copy.session.shareBest}` : "."}</p>
      {error && <p className="mt-3 text-[15px]">{error}</p>}
      {open ? (
        <PrimaryButton className="mt-4 w-full" disabled={pending} onClick={() => void join()}>{copy.session.joinSession}</PrimaryButton>
      ) : (
        <p className="mt-4 text-center text-[15px] font-semibold">{joinOpensLabel(phase.opensAt)}</p>
      )}
      {preview.failed && <button type="button" className="mt-3 text-[15px] font-semibold text-gosi-blue" onClick={preview.retry}>{copy.session.tryAgain}</button>}
      <PermissionSheet open={preview.denied} onClose={() => preview.setDenied(false)} onRetry={preview.retry} />
    </div>
  );
}
