"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAction } from "@/app/actions/flow";
import { copy } from "@/lib/copy";

export function CancelButton({ bookingId, personId, personaId, party }: { bookingId: string; personId: string; personaId: string; party: "seeker" | "retiree" }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className="rounded-full border px-4 py-2" onClick={() => start(async () => { await cancelAction(bookingId, personId, personaId, party); router.refresh(); })}>
      {copy.cancel}
    </button>
  );
}
