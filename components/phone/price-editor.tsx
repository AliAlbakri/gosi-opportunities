"use client";

import { useState, useTransition } from "react";
import { priceAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";

export function PriceEditor({ personId, personaId, floor, ceiling, rows }: { personId: string; personaId: string; floor: number; ceiling: number; rows: { id: string; name: string; mode: string; price: number | null; suggested: number }[] }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <PriceRow key={row.id} row={row} floor={floor} ceiling={ceiling} disabled={pending} onSave={(mode, price) => start(async () => {
          const result = await priceAction(personId, personaId, row.id, mode, price);
          setMessage(result.ok ? "Saved for new bookings." : result.error);
        })} />
      ))}
      {message && <p>{message}</p>}
    </div>
  );
}

function PriceRow({ row, floor, ceiling, disabled, onSave }: { row: { id: string; name: string; mode: string; price: number | null; suggested: number }; floor: number; ceiling: number; disabled: boolean; onSave: (mode: "free" | "paid", price: number | null) => void }) {
  const [mode, setMode] = useState<"free" | "paid">(row.mode === "paid" ? "paid" : "free");
  const [price, setPrice] = useState(row.price ?? row.suggested);
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="font-medium">{row.name}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("free")}>Free</button>
        <button type="button" onClick={() => setMode("paid")}>Paid</button>
      </div>
      {mode === "paid" && (
        <>
          <input type="range" min={floor} max={ceiling} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          <p>SAR {price}. Suggested for this Category: SAR {row.suggested}</p>
        </>
      )}
      <Button size="sm" disabled={disabled} onClick={() => onSave(mode, mode === "paid" ? price : null)}>Save price</Button>
    </div>
  );
}
