"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheet } from "@/components/phone/ui/flow";
import { PrimaryButton, SecondaryButton } from "@/components/phone/ui/buttons";
import { copy } from "@/lib/copy";

export function FilterBar({
  countText,
  languages,
  sort,
  language,
  rating,
  week,
}: {
  countText: string;
  languages: string[];
  sort: string;
  language?: string;
  rating?: boolean;
  week?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState(language ?? "");
  const [draftRating, setDraftRating] = useState(Boolean(rating));
  const [draftWeek, setDraftWeek] = useState(Boolean(week));
  const active = Number(Boolean(language)) + Number(Boolean(rating)) + Number(Boolean(week));
  const sortLabel = sort === "rating" ? copy.seekerUi.sortRating : sort === "sessions" ? copy.seekerUi.sortSessions : "Soonest";

  function push(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-gosi-midnight-10 bg-white px-5 py-2">
      <button type="button" className="inline-flex h-10 items-center gap-1 rounded-full bg-gosi-midnight-10 px-3 text-[13px] font-semibold text-gosi-rich-blue" onClick={() => setSortOpen(true)}>
        Sort: {sortLabel}
        <ChevronDown size={16} strokeWidth={1.75} className="text-gosi-midnight-50" />
      </button>
      <button type="button" className="inline-flex h-10 items-center rounded-full bg-gosi-midnight-10 px-3 text-[13px] font-semibold text-gosi-rich-blue" onClick={() => { setDraftLanguage(language ?? ""); setDraftRating(Boolean(rating)); setDraftWeek(Boolean(week)); setFiltersOpen(true); }}>
        {copy.seekerUi.filters}{active ? ` ${active}` : ""}
      </button>
      <span className="ml-auto text-[13px] text-gosi-midnight-50">{countText}</span>
      <BottomSheet title={copy.seekerUi.sortSoonest} open={sortOpen} onClose={() => setSortOpen(false)}>
        <div className="space-y-2">
          {[
            ["soonest", "Soonest"],
            ["rating", copy.seekerUi.sortRating],
            ["sessions", copy.seekerUi.sortSessions],
          ].map(([value, label]) => (
            <button key={value} type="button" className="block h-11 w-full rounded-2xl bg-gosi-midnight-10 px-4 text-left text-[15px] font-semibold" onClick={() => { push({ sort: value === "soonest" ? undefined : value }); setSortOpen(false); }}>
              {label}
            </button>
          ))}
        </div>
      </BottomSheet>
      <BottomSheet title={copy.seekerUi.filters} open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <div className="space-y-4">
          <label className="block text-[13px] font-semibold text-gosi-midnight-50">
            {copy.seekerUi.anyLanguage}
            <select className="mt-1 h-12 w-full rounded-2xl bg-gosi-midnight-10 px-3 text-[15px] font-semibold text-gosi-rich-blue" value={draftLanguage} onChange={(event) => setDraftLanguage(event.target.value)}>
              <option value="">{copy.seekerUi.anyLanguage}</option>
              {languages.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" className={`h-11 w-full rounded-full text-[15px] font-semibold ${draftRating ? "bg-gosi-rich-blue text-white" : "bg-gosi-midnight-10 text-gosi-rich-blue"}`} onClick={() => setDraftRating((value) => !value)}>{copy.seekerUi.ratingFilter}</button>
          <button type="button" className={`h-11 w-full rounded-full text-[15px] font-semibold ${draftWeek ? "bg-gosi-rich-blue text-white" : "bg-gosi-midnight-10 text-gosi-rich-blue"}`} onClick={() => setDraftWeek((value) => !value)}>{copy.seekerUi.weekFilter}</button>
          <PrimaryButton className="w-full" onClick={() => { push({ language: draftLanguage || undefined, rating: draftRating ? "4" : undefined, week: draftWeek ? "1" : undefined }); setFiltersOpen(false); }}>{copy.seekerUi.showResults}</PrimaryButton>
          <SecondaryButton className="w-full" onClick={() => { setDraftLanguage(""); setDraftRating(false); setDraftWeek(false); push({ language: undefined, rating: undefined, week: undefined }); setFiltersOpen(false); }}>{copy.seekerUi.clearFilters}</SecondaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
