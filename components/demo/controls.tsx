"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { jumpBookingAction, jumpMonthAction, resetClockAction, shiftClockAction } from "@/app/actions/demo";
import { copy } from "@/lib/copy";
import { formatLong } from "@/lib/format";

const shifts = [
  ["+1 hour", 3600, copy.clockHints.hour],
  ["+3 hours", 3 * 3600, copy.clockHints.three],
  ["+1 day", 86400, copy.clockHints.day],
  ["+48 hours", 48 * 3600, copy.clockHints.fortyEight],
] as const;

export function DemoControls({
  appNow,
  realNow,
  next,
}: {
  appNow: string;
  realNow: string;
  next: { label: string; when: string; seeker: string; retiree: string; seekerHref: string; retireeHref: string } | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (task: () => Promise<{ ok: boolean; error?: string }>) => {
    start(async () => {
      const result = await task();
      setError(result.ok ? null : result.error ?? "Try again.");
      router.refresh();
    });
  };
  return (
    <section className="max-w-xl space-y-6 rounded-3xl bg-white p-6 text-gosi-rich-blue">
      <div className="space-y-1">
        <p className="text-sm text-gosi-midnight-50">{copy.clockApp}</p>
        <p className="text-2xl font-medium">{formatLong(appNow)}</p>
        <p className="text-sm text-gosi-midnight-50">
          {copy.clockReal} {formatLong(realNow)}
        </p>
      </div>
      <div className="space-y-2">
        <p>{next ? `${copy.clockNext}: ${next.label}` : copy.clockNone}</p>
        {next && (
          <>
            <p className="text-sm">{next.when}</p>
            <p className="text-sm">{next.seeker} · {next.retiree}</p>
            <p className="flex flex-wrap gap-4 text-sm">
              <a className="text-gosi-blue" href={next.seekerHref} target="_blank" rel="noreferrer">Open in seeker phone</a>
              <a className="text-gosi-blue" href={next.retireeHref} target="_blank" rel="noreferrer">Open in retiree phone</a>
            </p>
          </>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {shifts.map(([label, seconds, hint]) => (
          <button key={label} type="button" disabled={pending} className="rounded-2xl bg-gosi-midnight-10 px-4 py-3 text-left" onClick={() => run(() => shiftClockAction(seconds))}>
            <span className="block font-medium">{label}</span>
            <span className="mt-1 block text-sm text-gosi-midnight-80">{hint}</span>
          </button>
        ))}
        <button type="button" disabled={pending} className="rounded-2xl bg-gosi-midnight-10 px-4 py-3 text-left" onClick={() => run(() => jumpBookingAction())}>
          <span className="block font-medium">Jump to next booking</span>
          <span className="mt-1 block text-sm text-gosi-midnight-80">{copy.clockHints.booking}</span>
        </button>
        <button type="button" disabled={pending} className="rounded-2xl bg-gosi-midnight-10 px-4 py-3 text-left" onClick={() => run(() => jumpMonthAction())}>
          <span className="block font-medium">Jump to month end</span>
          <span className="mt-1 block text-sm text-gosi-midnight-80">{copy.clockHints.month}</span>
        </button>
      </div>
      <button type="button" disabled={pending} className="w-full rounded-full bg-gosi-rich-blue px-4 py-3 text-white" onClick={() => run(() => resetClockAction())}>
        Reset clock to real time
      </button>
      <p className="text-sm text-gosi-midnight-80">{copy.clockHints.reset}</p>
      {error && <p className="text-sm">{error}</p>}
    </section>
  );
}
