"use client";

import { useState, useTransition } from "react";
import { jumpBookingAction, jumpMonthAction, resetClockAction, shiftClockAction } from "@/app/actions/demo";
import { formatLong } from "@/lib/format";

const buttons = [
  ["+1 hour", 3600],
  ["+3 hours", 3 * 3600],
  ["+1 day", 86400],
  ["+48 hours", 48 * 3600],
] as const;

export function DemoControls({
  appNow,
  realNow,
  nextLabel,
}: {
  appNow: string;
  realNow: string;
  nextLabel: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (task: () => Promise<{ ok: boolean; error?: string }>) => {
    start(async () => {
      const result = await task();
      setError(result.ok ? null : result.error ?? "Try again.");
    });
  };
  return (
    <aside className="fixed bottom-4 right-4 z-40 w-72 space-y-2 rounded-3xl bg-white p-4 text-sm text-gosi-rich-blue shadow">
      <p className="font-medium">Demo controls</p>
      <p>App time {formatLong(appNow)}</p>
      <p className="text-gosi-midnight-50">Real time {formatLong(realNow)}</p>
      {nextLabel && <p>Next session: {nextLabel}</p>}
      <div className="grid grid-cols-2 gap-2">
        {buttons.map(([label, seconds]) => (
          <button key={label} type="button" disabled={pending} className="rounded-full bg-gosi-midnight-10 px-2 py-2" onClick={() => run(() => shiftClockAction(seconds))}>
            {label}
          </button>
        ))}
        <button type="button" className="rounded-full bg-gosi-midnight-10 px-2 py-2" onClick={() => run(() => jumpBookingAction())}>Jump to next booking</button>
        <button type="button" className="rounded-full bg-gosi-midnight-10 px-2 py-2" onClick={() => run(() => jumpMonthAction())}>Jump to month end</button>
        <button type="button" className="col-span-2 rounded-full bg-gosi-rich-blue px-2 py-2 text-white" onClick={() => run(() => resetClockAction())}>Reset clock to real time</button>
      </div>
      {error && <p>{error}</p>}
    </aside>
  );
}
