"use client";

import { useEffect, useState, type ReactNode } from "react";
import { copy } from "@/lib/copy";

const KEY = "gosi-bookings-tab";

export function BookingTabs({
  upcomingCount,
  pastCount,
  upcoming,
  past,
}: {
  upcomingCount: number;
  pastCount: number;
  upcoming: ReactNode;
  past: ReactNode;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    if (saved === "past" || saved === "upcoming") setTab(saved);
  }, []);
  function choose(next: "upcoming" | "past") {
    setTab(next);
    sessionStorage.setItem(KEY, next);
  }
  const items = [
    ["upcoming", `${copy.seekerUi.upcoming} (${upcomingCount})`],
    ["past", `${copy.seekerUi.past} (${pastCount})`],
  ] as const;
  return (
    <>
      <div className="px-5">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-gosi-midnight-10 p-1">
          {items.map(([id, label]) => (
            <button key={id} type="button" className={`h-10 rounded-full text-[13px] font-semibold ${tab === id ? "bg-white text-gosi-rich-blue" : "text-gosi-midnight-50"}`} onClick={() => choose(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 px-5 py-4">{tab === "upcoming" ? upcoming : past}</div>
    </>
  );
}
