"use client";

import { Calendar } from "lucide-react";
import { copy } from "@/lib/copy";

function stamp(date: string) {
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function AddToCalendar({
  start,
  end,
  title,
  icon = false,
}: {
  start: string;
  end: string;
  title: string;
  icon?: boolean;
}) {
  function download() {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GOSI Opportunities//EN",
      "BEGIN:VEVENT",
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${title.replace(/\n/g, " ")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "session.ics";
    link.click();
    URL.revokeObjectURL(url);
  }
  if (icon) {
    return (
      <button type="button" aria-label={copy.seekerUi.addCalendar} className="grid h-10 w-10 place-items-center" onClick={download}>
        <Calendar size={20} strokeWidth={1.75} />
      </button>
    );
  }
  return (
    <button type="button" className="text-[15px] font-semibold text-gosi-blue" onClick={download}>
      {copy.seekerUi.addCalendar}
    </button>
  );
}
