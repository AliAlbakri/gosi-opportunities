"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/phone/ui/flow";
import { copy } from "@/lib/copy";

export function Blurb({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p className="mt-2 line-clamp-2 text-[15px] leading-[22px] text-gosi-midnight-50">{text}</p>
      <button type="button" className="mt-1 text-[15px] font-semibold text-gosi-blue" onClick={() => setOpen(true)}>{copy.seekerUi.more}</button>
      <BottomSheet title={copy.seekerUi.more} open={open} onClose={() => setOpen(false)}>
        <p className="text-[15px] leading-[22px]">{text}</p>
      </BottomSheet>
    </>
  );
}
