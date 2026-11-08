"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { expireAction, payAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { money } from "@/lib/format";

export function PaySheet({ bookingId, seekerId, personaId, amount, holdExpires, offset }: { bookingId: string; seekerId: string; personaId: string; amount: number; holdExpires: string; offset: number }) {
  const [method, setMethod] = useState<"mada" | "apple_pay" | "card">("mada");
  const [left, setLeft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      const now = Date.now() + offset * 1000;
      const ms = new Date(holdExpires).getTime() - now;
      if (ms <= 0) {
        setLeft("00:00");
        start(async () => { await expireAction(bookingId); setError("The hold expired. You have not been charged."); });
        return;
      }
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setLeft(`${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [bookingId, holdExpires, offset]);
  const pay = (success: boolean) => start(async () => {
    const result = await payAction(bookingId, seekerId, method, success);
    if (!result.ok) setError(result.error ?? copy.payFailed);
    else router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}`);
  });
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-xl font-medium">Secure payment · GOSI Opportunities</h1>
      <p>Merchant GOSI-OPP-001</p>
      <p className="text-2xl">{money(amount)}</p>
      <p>Time left {left}</p>
      <div className="flex gap-2">
        {(["mada", "apple_pay", "card"] as const).map((item) => (
          <button key={item} type="button" className={`rounded-full px-3 py-2 ${method === item ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setMethod(item)}>{item === "apple_pay" ? "Apple Pay" : item === "card" ? "Credit card" : "mada"}</button>
        ))}
      </div>
      {method === "card" && (
        <div className="space-y-2">
          <input className="h-11 w-full rounded-2xl border px-3" defaultValue="4242 4242 4242 4242" aria-label="Card number" />
          <input className="h-11 w-full rounded-2xl border px-3" defaultValue="12/30" aria-label="Expiry" />
          <input className="h-11 w-full rounded-2xl border px-3" defaultValue="123" aria-label="CVV" />
        </div>
      )}
      {error && <p>{error}</p>}
      <Button disabled={pending} onClick={() => pay(true)}>Pay</Button>
      <button type="button" className="text-sm" onClick={() => pay(false)}>Simulate failure</button>
      <button type="button" className="text-sm text-gosi-blue" onClick={() => start(async () => { await expireAction(bookingId); router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}`); })}>Close</button>
    </div>
  );
}
