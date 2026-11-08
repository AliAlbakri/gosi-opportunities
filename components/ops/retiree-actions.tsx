"use client";

import { useState, useTransition } from "react";
import { noteAction, pauseAction, restoreAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";
import { NOTE_TEMPLATES } from "@/lib/types";

export function RetireeActions({ operatorId, personId, paused }: { operatorId: string; personId: string; paused: boolean }) {
  const [template, setTemplate] = useState("GENERAL");
  const [body, setBody] = useState(NOTE_TEMPLATES.GENERAL.body);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3 rounded-2xl bg-white p-4">
      <h2 className="text-gosi-blue">Send a note</h2>
      <select value={template} onChange={(e) => { setTemplate(e.target.value); setBody(NOTE_TEMPLATES[e.target.value]?.body ?? ""); }}>
        {Object.entries(NOTE_TEMPLATES).map(([id, item]) => <option key={id} value={id}>{item.title}</option>)}
      </select>
      <TextArea value={body} onChange={(e) => setBody(e.target.value)} />
      <Button size="sm" disabled={pending} onClick={() => start(async () => { const result = await noteAction(operatorId, personId, template, body); setMessage(result.ok ? "Note sent." : result.error); })}>Send note</Button>
      {paused ? (
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const result = await restoreAction(operatorId, personId); setMessage(result.ok ? "Restored." : result.error); })}>Restore</Button>
      ) : (
        <>
          <TextArea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for pause" />
          <Button size="sm" variant="blue" disabled={pending} onClick={() => start(async () => { const result = await pauseAction(operatorId, personId, reason); setMessage(result.ok ? "Paused." : result.error); })}>Pause</Button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
