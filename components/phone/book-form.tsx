"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookAction } from "@/app/actions/flow";
import { AppHeader } from "@/components/phone/ui/header";
import { PrimaryButton, StickyFooter } from "@/components/phone/ui/buttons";
import { Stepper } from "@/components/phone/ui/flow";
import { DayStrip, SlotGrid } from "@/components/phone/ui/schedule";
import { copy } from "@/lib/copy";
import { formatClock, formatDay, formatWhen } from "@/lib/format";

function downloadIcs(title: string, startIso: string) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${stamp(start)}\nDTEND:${stamp(end)}\nSUMMARY:${title}\nEND:VEVENT\nEND:VCALENDAR`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  link.download = "gosi-session.ics";
  link.click();
}

export function BookForm({
  personaId,
  seekerId,
  birthDate,
  retireeId,
  retireeName,
  services,
  slots,
  initialService,
}: {
  personaId: string;
  seekerId: string;
  birthDate: string;
  retireeId: string;
  retireeName: string;
  services: { id: string; name: string; priceLabel: string; description: string }[];
  slots: string[];
  initialService?: string;
}) {
  const router = useRouter();
  const picked = services.find((row) => row.id === initialService)?.id;
  const chosen = picked ?? services[0]?.id ?? "";
  const [step, setStep] = useState(services.length > 1 && !picked ? 1 : 2);
  const [rst, setRst] = useState(chosen);
  const [openSlots, setOpenSlots] = useState(slots);
  const [need, setNeed] = useState("");
  const [goal, setGoal] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const service = services.find((row) => row.id === rst) ?? services[0];
  const days = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of openSlots) {
      const key = formatDay(item);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()].map(([key, items]) => ({ key, label: key.split(" ")[0] ?? key, date: key.split(" ")[1] ?? "", items }));
  }, [openSlots]);
  const [day, setDay] = useState(days[0]?.key ?? "");
  const [slot, setSlot] = useState(days[0]?.items[0] ?? "");
  const hours = days.find((row) => row.key === day)?.items ?? [];
  const groups = [
    { title: "Morning", slots: hours.filter((item) => Number(formatClock(item).slice(0, 2)) < 12).map((item) => ({ id: item, label: `${formatClock(item)}–${formatClock(new Date(new Date(item).getTime() + 3600000))}` })) },
    { title: "Afternoon", slots: hours.filter((item) => { const hour = Number(formatClock(item).slice(0, 2)); return hour >= 12 && hour < 17; }).map((item) => ({ id: item, label: `${formatClock(item)}–${formatClock(new Date(new Date(item).getTime() + 3600000))}` })) },
    { title: "Evening", slots: hours.filter((item) => Number(formatClock(item).slice(0, 2)) >= 17).map((item) => ({ id: item, label: `${formatClock(item)}–${formatClock(new Date(new Date(item).getTime() + 3600000))}` })) },
  ].filter((group) => group.slots.length);
  const labels = ["Service", "Date and time", "Your needs", "Review and confirm"];

  if (booked) {
    return (
      <div className="space-y-4 p-5 text-gosi-rich-blue">
        <h1 className="text-[28px] font-bold">You’re booked</h1>
        <p>{retireeName} · {service?.name}</p>
        <p>Find a quiet place, test your camera, and join from My bookings 10 minutes before.</p>
        <PrimaryButton onClick={() => downloadIcs(service?.name ?? "GOSI session", booked)}>Add to calendar</PrimaryButton>
        <PrimaryButton onClick={() => router.push(`/phone/${personaId}/opportunities/bookings`)}>View my bookings</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col text-gosi-rich-blue">
      <AppHeader title="Book a session" />
      <div className="space-y-4 px-5 pb-28">
        <Stepper step={step} total={4} label={labels[step - 1]} />
        <p className="text-[13px] text-gosi-midnight-50">{retireeName} · {service?.name}</p>
        {step === 1 && services.map((row) => (
          <button key={row.id} type="button" className={`block w-full rounded-[20px] p-4 text-left ${rst === row.id ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setRst(row.id)}>
            <p className="font-semibold">{row.name}</p>
            <p className="text-[13px]">{row.priceLabel}</p>
          </button>
        ))}
        {step === 2 && (
          <>
            <DayStrip days={days.map((row) => ({ key: row.key, label: row.label, date: row.date, open: true }))} selected={day} onSelect={(key) => { setDay(key); const first = days.find((row) => row.key === key)?.items[0]; if (first) setSlot(first); }} />
            <SlotGrid groups={groups} selected={slot} onSelect={setSlot} />
            {!openSlots.length && <p>Fully booked for now</p>}
            <p className="text-[13px] text-gosi-midnight-50">All times are Riyadh time. Book at least 24 hours ahead, up to 30 days.</p>
          </>
        )}
        {step === 3 && (
          <>
            <label className="block text-[15px] font-semibold">What do you need help with?<textarea className="mt-1 h-24 w-full rounded-2xl border p-3 font-normal" value={need} onChange={(event) => setNeed(event.target.value)} /></label>
            <label className="block text-[15px] font-semibold">What do you want out of the session?<textarea className="mt-1 h-24 w-full rounded-2xl border p-3 font-normal" value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
          </>
        )}
        {step === 4 && (
          <div className="rounded-[20px] bg-white p-4 text-[15px]">
            <p className="font-semibold">{retireeName}</p>
            <p>{service?.name}</p>
            <p>{slot ? `${formatWhen(slot)} · 1 hour · ${service?.priceLabel}` : ""}</p>
            <p className="mt-2 text-[13px] text-gosi-midnight-50">Cancellation is free up to 3 hours before. {copy.disclaimer}</p>
            <label className="mt-3 flex min-h-11 items-center gap-2"><input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />{copy.termsLabel}</label>
          </div>
        )}
        {error && <p className="text-[15px]">{error}</p>}
      </div>
      <StickyFooter>
        <div className="flex gap-2">
          {step > 1 && <button type="button" className="h-[52px] flex-1 rounded-full border" onClick={() => setStep(step - 1)}>Back</button>}
          <PrimaryButton className="flex-1" disabled={pending || (step === 2 && !hours.some((item) => item === slot)) || (step === 3 && (!need.trim() || !goal.trim())) || (step === 4 && !terms)} onClick={() => {
            if (step < 4) { setStep(step + 1); return; }
            start(async () => {
              const result = await bookAction({ personaId, seekerId, birthDate, retireeId, retireeServiceTypeId: rst, startsAt: slot, need, goal, terms });
              if (!result.ok) {
                const taken = result.error === copy.slotTaken;
                setError(taken ? "That time was just booked. Please pick another." : result.error);
                if (taken) {
                  const rest = openSlots.filter((item) => item !== slot);
                  setOpenSlots(rest);
                  const next = rest.find((item) => formatDay(item) === day) ?? rest[0];
                  if (next) { setDay(formatDay(next)); setSlot(next); }
                  setStep(2);
                }
                return;
              }
              if ("booking" in result && result.paid) router.push(`/phone/${personaId}/opportunities/bookings/${result.booking.id}/pay`);
              else if ("booking" in result) setBooked(slot);
            });
          }}>{step < 4 ? "Continue" : service?.priceLabel === "Free" ? "Confirm booking" : "Continue to payment"}</PrimaryButton>
        </div>
      </StickyFooter>
    </div>
  );
}
