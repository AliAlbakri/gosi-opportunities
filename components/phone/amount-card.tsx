"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AmountCard({ retiree }: { retiree: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[20px] bg-white p-3 text-left text-gosi-rich-blue">
      <span className="rounded-t-xl bg-gosi-blue px-2 py-1 text-[11px] font-semibold text-white">{retiree ? "Monthly pension" : "Active contribution"}</span>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xl font-semibold">{open ? "SAR 8,450" : "••••"} /Month</p>
        <button type="button" aria-label={open ? "Hide amount" : "Show amount"} className="grid h-11 w-11 place-items-center" onClick={() => setOpen(!open)}>
          {open ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <p className="text-[13px] text-gosi-midnight-50">{retiree ? "Pension system" : "Employer"}</p>
      <p className="text-[15px] font-semibold">{retiree ? "Private" : "The General Organization"}</p>
    </div>
  );
}
