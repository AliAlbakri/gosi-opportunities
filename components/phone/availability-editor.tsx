"use client";

import { useMemo, useState, useTransition } from "react";
import { acceptingAction, windowsAction } from "@/app/actions/flow";
import { AppHeader } from "@/components/phone/ui/header";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { BottomSheet } from "@/components/phone/ui/flow";
import { WEEKDAYS } from "@/lib/types";

const hours = Array.from({ length: 18 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`);

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
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [accepts, setAccepts] = useState(accepting);
  const [day, setDay] = useState(0);
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("21:00");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const preview = useMemo(() => rows.slice(0, 7).map((row) => `${WEEKDAYS[row.weekday].slice(0, 3)} ${row.start}–${row.end}`), [rows]);

  const save = (next: typeof rows) => {
    setRows(next);
    startTransition(async () => {
      const result = await windowsAction(personId, personaId, next);
      setMessage(result.ok ? "Saved" : result.error);
    });
  };

  return (
    <div className="space-y-4 px-5 py-2 text-gosi-rich-blue">
      <AppHeader title="Availability" />
      {!paused && (
        <label className="flex min-h-11 items-center justify-between rounded-[20px] bg-white px-4">
          <span>
            <span className="block text-[15px] font-semibold">Accepting new bookings</span>
            <span className="text-[13px] text-gosi-midnight-50">Turn this off to pause new bookings.</span>
          </span>
          <input type="checkbox" className="h-6 w-6" checked={accepts} onChange={(event) => {
            const value = event.target.checked;
            setAccepts(value);
            startTransition(async () => { await acceptingAction(personId, personaId, value); });
          }} />
        </label>
      )}
      {WEEKDAYS.map((name, weekday) => {
        const chips = rows.filter((row) => row.weekday === weekday);
        return (
          <div key={name} className="rounded-[20px] bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{name}</p>
              <button type="button" className="h-11 px-2 text-[15px] font-semibold text-gosi-blue" onClick={() => { setDay(weekday); setOpen(true); }}>+ Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button key={`${chip.start}-${chip.end}`} type="button" className="h-11 rounded-full bg-gosi-green-10 px-3 text-[13px] font-semibold" onClick={() => save(rows.filter((row) => row !== chip))}>
                  {chip.start}–{chip.end}
                </button>
              ))}
              {!chips.length && <p className="text-[13px] text-gosi-midnight-50">No hours</p>}
            </div>
          </div>
        );
      })}
      <div>
        <p className="text-[13px] font-semibold text-gosi-midnight-50">Preview: your next bookable slots</p>
        <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {preview.map((label) => <span key={label} className="shrink-0 rounded-full bg-white px-3 py-2 text-[13px]">{label}</span>)}
          {!preview.length && <span className="text-[13px] text-gosi-midnight-50">Add hours to see slots</span>}
        </div>
      </div>
      {message && <p className="text-[15px]">{message}</p>}
      <BottomSheet title="Add hours" open={open} onClose={() => setOpen(false)}>
        <p className="mt-2 text-[15px]">{WEEKDAYS[day]}</p>
        <label className="mt-3 block text-[13px] font-semibold">Start
          <select className="mt-1 h-12 w-full rounded-[14px] border px-3 text-[15px]" value={start} onChange={(event) => setStart(event.target.value)}>{hours.map((hour) => <option key={hour}>{hour}</option>)}</select>
        </label>
        <label className="mt-3 block text-[13px] font-semibold">End
          <select className="mt-1 h-12 w-full rounded-[14px] border px-3 text-[15px]" value={end} onChange={(event) => setEnd(event.target.value)}>{hours.map((hour) => <option key={hour}>{hour}</option>)}</select>
        </label>
        <PrimaryButton className="mt-4 w-full" disabled={pending || end <= start} onClick={() => { save([...rows, { weekday: day, start, end }]); setOpen(false); }}>Add hours</PrimaryButton>
      </BottomSheet>
    </div>
  );
}
