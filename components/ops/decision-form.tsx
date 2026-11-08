"use client";

import { useState, useTransition } from "react";
import { decideAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { REASON_CODES } from "@/lib/types";

export function DecisionForm({ operatorId, rstId }: { operatorId: string; rstId: string }) {
  const [reason, setReason] = useState<keyof typeof REASON_CODES>("NOT_MATCHING");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const send = (decision: "approved" | "not_approved") => start(async () => {
    const result = await decideAction({ operatorId, rstId, decision, reasonCode: decision === "not_approved" ? reason : undefined, reasonNote: note });
    setMessage(result.ok ? "Saved" : result.error);
  });
  return (
    <div className="space-y-2">
      <select value={reason} onChange={(e) => setReason(e.target.value as keyof typeof REASON_CODES)}>
        {Object.entries(REASON_CODES).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
      <input className="h-10 w-full rounded-xl border px-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => send("approved")}>Approve</Button>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => send("not_approved")}>Not approve</Button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
