"use client";

import { useState, useTransition } from "react";
import { techAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import type { AppSettings, Category } from "@/lib/types";

export function TechForm({ settings, categories, futurePaid }: { settings: AppSettings; categories: Category[]; futurePaid: number }) {
  const [paid, setPaid] = useState(settings.paid_enabled);
  const [floor, setFloor] = useState(settings.price_floor);
  const [ceiling, setCeiling] = useState(settings.price_ceiling);
  const [suggested, setSuggested] = useState<Record<string, number>>(Object.fromEntries(categories.map((row) => [row.id, row.suggested_price])));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="mt-6 max-w-xl space-y-3 rounded-3xl bg-white p-6" onSubmit={(event) => {
      event.preventDefault();
      if (!paid && settings.paid_enabled && !window.confirm(`${futurePaid} confirmed paid bookings will be cancelled and refunded.`)) return;
      if (paid && !settings.paid_enabled && !window.confirm("Turn paid sessions on?")) return;
      start(async () => {
        const result = await techAction({ paidEnabled: paid, floor, ceiling, suggested });
        setMessage(result.ok ? "Saved" : result.error);
      });
    }}>
      <span className="rounded-full bg-gosi-amber-bg px-2 py-1 text-xs text-gosi-amber-text">Paid switch</span>
      <label className="flex items-center gap-2"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} /> Paid sessions</label>
      <label className="block">Price floor <input className="h-10 w-full rounded-xl border px-2" type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} /></label>
      <label className="block">Price ceiling <input className="h-10 w-full rounded-xl border px-2" type="number" value={ceiling} onChange={(e) => setCeiling(Number(e.target.value))} /></label>
      {categories.map((category) => (
        <label key={category.id} className="block">Suggested for {category.name}
          <input className="h-10 w-full rounded-xl border px-2" type="number" value={suggested[category.id]} onChange={(e) => setSuggested({ ...suggested, [category.id]: Number(e.target.value) })} />
        </label>
      ))}
      <Button size="md" disabled={pending} type="submit">Save</Button>
      {message && <p>{message}</p>}
    </form>
  );
}
