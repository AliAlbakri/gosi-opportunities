"use client";

import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";

const KEY = "gosi-how-dismissed";

export function HowItWorks({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(show && localStorage.getItem(KEY) !== "1");
  }, [show]);
  if (!visible) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold">{copy.seekerUi.howTitle}</h2>
      <div className="mt-3 rounded-[20px] bg-white p-3">
        <div className="grid grid-cols-3 gap-2 text-center text-[13px]">
          {[
            ["individuals", copy.seekerUi.choose],
            ["calendar", copy.seekerUi.bookHour],
            ["phone", copy.seekerUi.meet],
          ].map(([icon, label]) => (
            <div key={label}>
              <BrandIcon name={icon} className="mx-auto h-8 w-8" />
              <p className="mt-2">{label}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 h-11 w-full text-[15px] font-semibold text-gosi-blue"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setVisible(false);
          }}
        >
          {copy.seekerUi.gotIt}
        </button>
      </div>
    </section>
  );
}
