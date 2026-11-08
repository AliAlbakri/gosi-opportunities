"use client";

import { useState, useTransition } from "react";
import { acceptingAction, windowsAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { WEEKDAYS } from "@/lib/types";

export function AvailabilityEditor({
  personId,
  personaId,
  initial,
  accepting,
  paused,
}: {
  personId: string;
  personaId: string;
  initial: { weekday: number; start: string; end: string }[];
  accepting: boolean;
  paused: boolean;
}) {
  const [rows, setRows] = useState(initial.length ? initial : [{ weekday: 0, start: "09:00", end: "17:00" }]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Availability</h1>
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-3 gap-2">
          <select value={row.weekday} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, weekday: Number(e.target.value) } : item))}>
            {WEEKDAYS.map((day, weekday) => <option key={day} value={weekday}>{day}</option>)}
          </select>
          <input value={row.start} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, start: e.target.value } : item))} />
          <input value={row.end} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, end: e.target.value } : item))} />
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, { weekday: 0, start: "09:00", end: "12:00" }])}>Add a window</button>
      <Button disabled={pending} onClick={() => start(async () => {
        const result = await windowsAction(personId, personaId, rows);
        setMessage(result.ok ? "Saved" : result.error);
      })}>Save hours</Button>
      {!paused && (
        <Button variant="secondary" disabled={pending} onClick={() => start(async () => { await acceptingAction(personId, personaId, !accepting); setMessage(accepting ? "New bookings are paused." : "You are accepting bookings."); })}>
          {accepting ? "Pause new bookings" : "Accept new bookings"}
        </Button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
