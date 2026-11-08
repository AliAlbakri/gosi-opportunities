"use client";

import { useState, useTransition } from "react";
import { closeComplaintAction, disputeAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";

export function ReportActions({ operatorId, reportId, kind }: { operatorId: string; reportId: string; kind: string }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2">
      <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Decision note" />
      {kind === "dispute" ? (
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => start(async () => { const result = await disputeAction({ operatorId, reportId, uphold: true, note }); setMessage(result.ok ? "Refunded in full." : result.error); })}>Refund in full</Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const result = await disputeAction({ operatorId, reportId, uphold: false, note }); setMessage(result.ok ? "Rejected." : result.error); })}>Reject</Button>
        </div>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => start(async () => { const result = await closeComplaintAction(operatorId, reportId, note); setMessage(result.ok ? "Closed." : result.error); })}>Close</Button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
