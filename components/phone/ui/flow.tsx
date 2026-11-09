"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type FaqAnswer = string | { off: string; on: string };

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

export function FaqList({ items, paid }: { items: readonly { q: string; a: FaqAnswer }[]; paid: boolean }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-gosi-midnight-10 overflow-hidden rounded-[20px] bg-white">
      {items.map((item, index) => {
        const isOpen = open === index;
        const answer = typeof item.a === "string" ? item.a : paid ? item.a.on : item.a.off;
        return (
          <div key={item.q} className="p-4">
            <button type="button" className="flex w-full items-start gap-3 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : index)}>
              <span className="flex-1 text-[15px] font-semibold leading-[22px] text-gosi-rich-blue">{item.q}</span>
              <ChevronDown className={`mt-0.5 shrink-0 text-gosi-rich-blue transition-transform ${isOpen ? "rotate-180" : ""}`} size={20} strokeWidth={1.75} aria-hidden />
            </button>
            {isOpen && <p className="pt-2 text-[15px] font-normal leading-[22px] text-gosi-midnight-50">{answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
