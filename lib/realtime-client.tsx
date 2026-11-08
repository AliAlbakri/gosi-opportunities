"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserSupabase, hasRealtimeEnv } from "@/lib/supabase/browser";

export type Banner = { title: string; body: string; link?: string | null };

export function useLiveUpdates(personaId?: string) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (!hasRealtimeEnv()) return;
    const supabase = browserSupabase();
    if (!supabase) return;
    const demo = supabase
      .channel("demo")
      .on("broadcast", { event: "clock.changed" }, () => router.refresh())
      .on("broadcast", { event: "settings.changed" }, () => router.refresh())
      .on("broadcast", { event: "data.reset" }, () => {
        router.refresh();
        if (window.top === window.self) window.location.reload();
      })
      .subscribe();
    const persona = personaId
      ? supabase
          .channel(`persona:${personaId}`)
          .on("broadcast", { event: "notification" }, ({ payload }) => {
            setBanner(payload as Banner);
            router.refresh();
          })
          .subscribe()
      : null;
    return () => {
      supabase.removeChannel(demo);
      if (persona) supabase.removeChannel(persona);
    };
  }, [personaId, router]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

  return { banner, dismiss: () => setBanner(null) };
}
