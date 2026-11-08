"use client";

import { useState, useTransition } from "react";
import { readinessAction, testCallAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";

export function ReadinessButton({ personaId, personId, name, done }: { personaId: string; personId: string; name: string; done: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) return <p className="rounded-3xl bg-gosi-green-10 p-4">Readiness test passed</p>;
  return (
    <div className="space-y-2 rounded-3xl bg-white p-4">
      <Button size="md" disabled={pending} onClick={() => start(async () => {
        const result = await testCallAction(personaId, name);
        if (!result.ok) setError(result.error);
        else setUrl(result.url);
      })}>Start readiness test</Button>
      {url && <iframe title="Readiness" src={url} className="h-64 w-full" allow="camera; microphone" />}
      <Button size="md" variant="secondary" onClick={() => start(async () => { await readinessAction(personId, personaId); })}>I can see and hear myself</Button>
      <p className="text-sm">If something is not working, check the camera permission and try again.</p>
      {error && <p>{error}</p>}
    </div>
  );
}
