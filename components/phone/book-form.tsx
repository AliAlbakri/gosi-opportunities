"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/fields";
import { copy } from "@/lib/copy";
import { formatClock, formatDay } from "@/lib/format";

export function BookForm({
  personaId,
  seekerId,
  birthDate,
  retireeId,
  services,
  slots,
  paid,
}: {
  personaId: string;
  seekerId: string;
  birthDate: string;
  retireeId: string;
  services: { id: string; name: string; priceLabel: string }[];
  slots: string[];
  paid: boolean;
}) {
  const [rst, setRst] = useState(services[0]?.id ?? "");
  const [slot, setSlot] = useState(slots[0] ?? "");
  const days = [...slots.reduce((map, item) => {
    const day = formatDay(item);
    map.set(day, [...(map.get(day) ?? []), item]);
    return map;
  }, new Map<string, string[]>())];
  const activeDay = days.find(([, hours]) => hours.includes(slot))?.[0] ?? days[0]?.[0] ?? "";
  const hours = days.find(([day]) => day === activeDay)?.[1] ?? [];
  const [need, setNeed] = useState("");
  const [goal, setGoal] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form className="space-y-3 p-4 text-gosi-rich-blue" onSubmit={(event) => {
      event.preventDefault();
      start(async () => {
        const result = await bookAction({ personaId, seekerId, birthDate, retireeId, retireeServiceTypeId: rst, startsAt: slot, need, goal, terms });
        if (!result.ok) setError(result.error);
        else if ("booking" in result && result.paid) router.push(`/phone/${personaId}/opportunities/bookings/${result.booking.id}/pay`);
        else if ("booking" in result) router.push(`/phone/${personaId}/opportunities/bookings/${result.booking.id}`);
      });
    }}>
      <Field label="Service Type">
        <select className="h-11 w-full rounded-2xl border px-3" value={rst} onChange={(e) => setRst(e.target.value)}>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.priceLabel}</option>)}
        </select>
      </Field>
      <div className="flex gap-2 overflow-x-auto">
        {days.map(([day, items]) => (
          <button type="button" key={day} className={`shrink-0 rounded-2xl px-3 py-2 ${day === activeDay ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setSlot(items[0])}>{day}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {hours.map((item) => (
          <button type="button" key={item} className={`rounded-full px-3 py-2 ${item === slot ? "bg-gosi-vivid-green" : "bg-white"}`} onClick={() => setSlot(item)}>{formatClock(item)}</button>
        ))}
      </div>
      {!slots.length && <p>{copy.fullyBooked}</p>}
      <Field label="What do you need help with?"><TextArea value={need} onChange={(e) => setNeed(e.target.value)} /></Field>
      <Field label="What do you want out of the session?"><TextArea value={goal} onChange={(e) => setGoal(e.target.value)} /></Field>
      <p className="text-sm">{copy.disclaimer}</p>
      <div className="max-h-24 overflow-y-auto text-xs">{copy.termsBody}</div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />{copy.termsLabel}</label>
      {error && <p>{error}</p>}
      <Button disabled={pending || !slot}>{paid ? copy.continuePay : copy.confirmBooking}</Button>
    </form>
  );
}
