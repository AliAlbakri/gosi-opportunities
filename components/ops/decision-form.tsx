"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { REASON_CODES } from "@/lib/types";

export function DecisionForm({ operatorId, rstId }: { operatorId: string; rstId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<keyof typeof REASON_CODES>("NOT_MATCHING");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const send = (decision: "approved" | "not_approved") => start(async () => {
    const result = await decideAction({
      operatorId,
      rstId,
      decision,
      reasonCode: decision === "not_approved" ? reason : undefined,
      reasonNote: decision === "not_approved" ? note : undefined,
    });
    if (!result.ok) return setMessage(result.error);
    setMessage(copy.opsReview.saved);
    router.refresh();
  });
  if (!rejecting) {
    return (
      <div className="space-y-2 pt-1">
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => send("approved")}>{copy.opsReview.approve}</Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => setRejecting(true)}>{copy.opsReview.notApprove}</Button>
        </div>
        {message && <p className="text-sm">{message}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-xl bg-gosi-midnight-10 p-3">
      <p className="text-sm font-semibold">{copy.opsReview.why}</p>
      <select className="h-10 w-full rounded-xl border border-gosi-midnight-25 bg-white px-2 text-sm" value={reason} onChange={(event) => setReason(event.target.value as keyof typeof REASON_CODES)}>
        {Object.entries(REASON_CODES).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
      <input className="h-10 w-full rounded-xl border border-gosi-midnight-25 bg-white px-3 text-sm" value={note} onChange={(event) => setNote(event.target.value)} placeholder={copy.opsReview.note} />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => { setRejecting(false); setMessage(null); }}>{copy.opsReview.back}</Button>
        <Button size="sm" variant="blue" disabled={pending} onClick={() => send("not_approved")}>{copy.opsReview.notApprove}</Button>
      </div>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
