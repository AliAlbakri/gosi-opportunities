"use client";

import { useState } from "react";
import { Eye, Lock, Shield } from "lucide-react";
import { BottomSheet } from "@/components/phone/ui/flow";
import { InfoButton, StepHeading, SwitchRow } from "@/components/phone/wizard-layout";
import { copy } from "@/lib/copy";
import { formatSpan } from "@/lib/format";
import type { PreviewJob } from "@/components/phone/profile-preview";

export function RecordStep({
  record,
  jobs,
  showEmployers,
  showDates,
  showSector,
  onChange,
}: {
  record: { name: string; pension: string; years: number; lastActive: string };
  jobs: PreviewJob[];
  showEmployers: boolean;
  showDates: boolean;
  showSector: boolean;
  onChange: (patch: { showEmployers?: boolean; showDates?: boolean; showSector?: boolean }) => void;
}) {
  const [preview, setPreview] = useState(false);
  const timeline = [...jobs].sort((a, b) => (b.end_date ?? "9999").localeCompare(a.end_date ?? "9999"));
  const pension = record.pension === "public" ? copy.wizard.pensionPublic : record.pension === "combined" ? copy.wizard.pensionCombined : copy.wizard.pensionPrivate;
  const letters = record.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  return (
    <div className="space-y-6">
      <StepHeading title={copy.wizard.recordTitle} subtitle={copy.wizard.recordSubtitle} />
      <section className="overflow-hidden rounded-[20px] bg-white">
        <div className="flex items-center gap-2 bg-gosi-rich-blue px-4 py-3 text-white">
          <Shield size={18} strokeWidth={1.75} />
          <span className="flex-1 text-[15px] font-semibold">{copy.verified}</span>
          <InfoButton title={copy.verified} body={copy.wizard.recordSheet} light />
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gosi-rich-blue to-gosi-blue text-[15px] font-semibold text-white">{letters}</span>
            <span>
              <span className="block text-[15px] font-semibold leading-[22px]">{record.name}</span>
              <span className="mt-1 inline-flex rounded-full bg-gosi-green-10 px-2 py-0.5 text-[11px] leading-[14px]">{copy.wizard.confirmed}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[`${record.years} ${copy.wizard.yearsExperience}`, `${copy.wizard.lastActive} ${record.lastActive}`, pension].map((chip) => (
              <span key={chip} className="rounded-full bg-gosi-midnight-10 px-3 py-1 text-[13px] leading-[18px]">{chip}</span>
            ))}
          </div>
          <ol className="space-y-3">
            {timeline.map((job) => (
              <li key={job.id} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gosi-vivid-green" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-[22px]">{job.employer}</span>
                  <span className="mt-1 inline-flex rounded-full bg-gosi-midnight-10 px-2 py-0.5 text-[11px] leading-[14px]">{job.sector}</span>
                  <span className="mt-1 block text-[13px] leading-[18px] text-gosi-midnight-50">{formatSpan(job.start_date, job.end_date)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="rounded-[20px] bg-white px-4">
        <p className="pt-3 text-[15px] font-semibold">{copy.wizard.showTitle}</p>
        <div className="divide-y divide-gosi-midnight-10">
          <SwitchRow label={copy.wizard.showEmployers} hint={copy.wizard.showEmployersHint} checked={showEmployers} onChange={(checked) => onChange({ showEmployers: checked })} />
          <SwitchRow label={copy.wizard.showDates} hint={copy.wizard.showDatesHint} checked={showDates} onChange={(checked) => onChange({ showDates: checked })} />
          <SwitchRow label={copy.wizard.showSector} hint={copy.wizard.showSectorHint} checked={showSector} onChange={(checked) => onChange({ showSector: checked })} />
        </div>
        <p className="flex items-start gap-2 border-t border-gosi-midnight-10 py-3 text-[13px] leading-[18px] text-gosi-midnight-50">
          <Lock size={14} className="mt-0.5 shrink-0" />
          {copy.wizard.alwaysShown}
        </p>
      </section>
      <button type="button" className="inline-flex items-center gap-2 text-[15px] font-semibold text-gosi-blue" onClick={() => setPreview(true)}>
        <Eye size={18} />
        {copy.wizard.preview}
      </button>
      <BottomSheet title={copy.wizard.preview} open={preview} onClose={() => setPreview(false)}>
        <p className="text-[15px] font-semibold">{record.name}</p>
        <p className="mt-1 text-[13px] text-gosi-midnight-50">{copy.wizard.confirmed}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[`${record.years} ${copy.wizard.yearsExperience}`, `${copy.wizard.lastActive} ${record.lastActive}`].map((chip) => (
            <span key={chip} className="rounded-full bg-gosi-midnight-10 px-3 py-1 text-[13px]">{chip}</span>
          ))}
        </div>
        <ol className="mt-4 space-y-3">
          {timeline.map((job) => {
            const shown = showEmployers || showDates || showSector;
            if (!shown || (showEmployers && job.employer === "Earlier employer" && !showDates && !showSector)) return null;
            return (
              <li key={job.id}>
                {showEmployers && job.employer !== "Earlier employer" && <p className="text-[15px] font-semibold">{job.employer}</p>}
                {showSector && <p className="text-[13px] text-gosi-midnight-50">{job.sector}</p>}
                {showDates && <p className="text-[13px] text-gosi-midnight-50">{formatSpan(job.start_date, job.end_date)}</p>}
              </li>
            );
          })}
        </ol>
      </BottomSheet>
    </div>
  );
}
