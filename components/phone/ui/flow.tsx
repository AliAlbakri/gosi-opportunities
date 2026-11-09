"use client";

import { useState, type ReactNode } from "react";

export function Stepper({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={`h-1 flex-1 rounded-full ${index < step ? "bg-gosi-vivid-green" : "bg-gosi-midnight-10"}`} />
        ))}
      </div>
      <p className="mt-2 text-[13px] font-semibold text-gosi-midnight-50">Step {step} of {total} · {label}</p>
    </div>
  );
}

export function Timeline({ items }: { items: { title: string; caption?: string; state: "done" | "current" | "upcoming" }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.state === "upcoming" ? "bg-gosi-midnight-25" : "bg-gosi-vivid-green"}`} />
          <span>
            <p className={`text-[15px] font-semibold ${item.state === "upcoming" ? "text-gosi-midnight-50" : "text-gosi-rich-blue"}`}>{item.title}</p>
            {item.caption && <p className="text-[13px] text-gosi-midnight-50">{item.caption}</p>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function BottomSheet({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-gosi-rich-blue/40" onClick={onClose}>
      <div className="max-h-[80%] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-gosi-rich-blue" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gosi-midnight-25" />
        <p className="text-lg font-semibold">{title}</p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="divide-y divide-gosi-midnight-10 overflow-hidden rounded-[20px] bg-white">
      {items.map((item) => (
        <button key={item.q} type="button" className="block w-full px-4 py-3 text-left" onClick={() => setOpen(open === item.q ? null : item.q)}>
          <p className="text-[15px] font-semibold text-gosi-rich-blue">{item.q}</p>
          {open === item.q && <p className="mt-1 text-[13px] text-gosi-midnight-50">{item.a}</p>}
        </button>
      ))}
    </div>
  );
}
