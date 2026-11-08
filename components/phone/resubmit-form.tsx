"use client";

import { useState, useTransition } from "react";
import { resubmitAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";

export function ResubmitForm({ personId, personaId, rows }: { personId: string; personaId: string; rows: { id: string; description: string }[] }) {
  const [text, setText] = useState<Record<string, string>>(Object.fromEntries(rows.map((row) => [row.id, row.description])));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!rows.length) return null;
  return (
    <div className="space-y-2">
      {rows.map((row) => <TextArea key={row.id} value={text[row.id]} onChange={(e) => setText({ ...text, [row.id]: e.target.value })} />)}
      <Button disabled={pending} onClick={() => start(async () => {
        const result = await resubmitAction(personId, personaId, rows.map((row) => ({ id: row.id, description: text[row.id] ?? "" })));
        setMessage(result.ok ? "Sent back for review." : result.error);
      })}>Resubmit</Button>
      {message && <p>{message}</p>}
    </div>
  );
}
