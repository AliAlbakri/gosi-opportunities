"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { joinAction } from "@/app/actions/flow";

export function CallFrame({ bookingId, personId, personaId, name, offset, serviceName, startsAt, role }: { bookingId: string; personId: string; personaId: string; name: string; offset: number; serviceName: string; startsAt: string; role: "seeker" | "retiree" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const router = useRouter();
  useEffect(() => {
    let frame: { destroy: () => void } | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    (async () => {
      const result = await joinAction(bookingId, personId, name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const Daily = (await import("@daily-co/daily-js")).default;
      if (cancelled || !ref.current) return;
      const call = Daily.createFrame(ref.current, {
        iframeStyle: { width: "100%", height: "100%", border: "0" },
        showLeaveButton: true,
      });
      frame = call;
      const post = (event: "joined" | "left") => {
        fetch(`/api/sessions/${bookingId}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId, event }),
        });
      };
      call.on("joined-meeting", () => post("joined"));
      call.on("left-meeting", () => {
        post("left");
        if (role === "seeker") router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}/feedback`);
      });
      await call.join({ url: result.url });
      const tick = () => {
        const appNow = Date.now() + offset * 1000;
        const seconds = Math.max(0, Math.floor((appNow - new Date(startsAt).getTime()) / 1000));
        setElapsed(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`);
        if (appNow >= new Date(result.endsAt).getTime()) {
          setBanner(result.hasNext ? "Scheduled time has ended. You can continue. Your next session starts now." : "Scheduled time has ended. You can continue.");
        }
      };
      tick();
      timer = setInterval(tick, 1000);
    })();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      frame?.destroy();
    };
  }, [bookingId, name, offset, personId, personaId, role, router, startsAt]);
  return (
    <div className="relative h-[70vh] bg-gosi-midnight">
      <div className="absolute inset-x-0 top-0 z-10 bg-gosi-rich-blue px-3 py-2 text-xs text-white">
        <p>{serviceName}</p>
        <p>{elapsed} · Scheduled time: 1 hour</p>
      </div>
      {banner && <p className="absolute inset-x-2 top-12 z-10 rounded-2xl bg-white p-2 text-sm text-gosi-rich-blue">{banner}</p>}
      {error && <p className="p-4 text-white">{error}</p>}
      <div ref={ref} className="h-full" />
    </div>
  );
}
