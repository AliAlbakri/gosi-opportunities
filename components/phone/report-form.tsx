"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reportAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";
import { REPORT_REASONS } from "@/lib/types";

export function ReportForm({ personaId, bookingId, reporterId }: { personaId: string; bookingId: string; reporterId: string }) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form className="space-y-3 p-4 text-gosi-rich-blue" onSubmit={(event) => {
      event.preventDefault();
      start(async () => {
        const result = await reportAction({ bookingId, reporterId, reason, description });
        if (!result.ok) setError(result.error);
        else router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}`);
      });
    }}>
      <h1 className="text-2xl font-medium">Report a problem</h1>
      {REPORT_REASONS.map((item) => <label key={item} className="flex gap-2"><input type="radio" name="reason" checked={reason === item} onChange={() => setReason(item)} />{item}</label>)}
      <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p>{error}</p>}
      <Button disabled={pending} type="submit">Send</Button>
    </form>
  );
}
