"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAction } from "@/app/actions/flow";
import { copy } from "@/lib/copy";

export function CancelButton({ bookingId, personId, personaId, party, late = false }: { bookingId: string; personId: string; personaId: string; party: "seeker" | "retiree"; late?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className="h-11 rounded-full border px-4" onClick={() => {
      const warning = late ? "This will be recorded as a late cancellation." : "Cancel this session?";
      if (!window.confirm(warning)) return;
      start(async () => { await cancelAction(bookingId, personId, personaId, party); router.refresh(); });
    }}>
      {copy.cancel}
    </button>
  );
}
