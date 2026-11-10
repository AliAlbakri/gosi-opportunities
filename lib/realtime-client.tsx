"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserSupabase, hasRealtimeEnv } from "@/lib/supabase/browser";

export type Banner = { title: string; body: string; link?: string | null };

const offsetListeners = new Set<(offset: number) => void>();

export function publishClockOffset(offset: number) {
  offsetListeners.forEach((listener) => listener(offset));
}

export function useAppOffset(serverOffset: number) {
  const [offset, setOffset] = useState(serverOffset);
  useEffect(() => {
    setOffset((current) => (serverOffset >= current ? serverOffset : current));
  }, [serverOffset]);
  useEffect(() => {
    offsetListeners.add(setOffset);
    return () => {
      offsetListeners.delete(setOffset);
    };
  }, []);
  return offset;
}

function readOffset(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as { offset?: unknown; payload?: { offset?: unknown } };
  if (typeof record.offset === "number") return record.offset;
  if (typeof record.payload?.offset === "number") return record.payload.offset;
  return null;
}

export function useLiveUpdates(personaId?: string, onClock?: (offset: number) => void) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!hasRealtimeEnv()) return;
    const supabase = browserSupabase();
    if (!supabase) return;
    const demo = supabase
      .channel("demo")
      .on("broadcast", { event: "clock.changed" }, ({ payload }) => {
        const next = readOffset(payload);
        if (next != null) {
          publishClockOffset(next);
          onClock?.(next);
        }
        router.refresh();
      })
      .on("broadcast", { event: "settings.changed" }, () => router.refresh())
      .on("broadcast", { event: "data.reset" }, () => {
        router.refresh();
        if (window.top === window.self) window.location.reload();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive(true);
      });
    const persona = personaId
      ? supabase
          .channel(`persona:${personaId}`)
          .on("broadcast", { event: "notification" }, ({ payload }) => {
            setBanner(payload as Banner);
            router.refresh();
          })
          .on("broadcast", { event: "presence" }, () => router.refresh())
          .subscribe()
      : null;
    return () => {
      supabase.removeChannel(demo);
      if (persona) supabase.removeChannel(persona);
    };
  }, [onClock, personaId, router]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

  return { banner, live, dismiss: () => setBanner(null) };
}
