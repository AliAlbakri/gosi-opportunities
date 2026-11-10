"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";
import { serviceIcons } from "@/lib/phone-icons";
import { StepHeading } from "@/components/phone/wizard-layout";
import type { ServiceType } from "@/lib/types";

function Chip({ children }: { children: string }) {
  return <span className="rounded-full bg-gosi-midnight-10 px-2.5 py-1 text-[13px] font-semibold">{children}</span>;
}

function SummaryCard({
  icon,
  title,
  summary,
  open,
  onToggle,
  onEdit,
  children,
}: {
  icon: string;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] bg-white">
      <div className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-gosi-green-10">
          <BrandIcon name={icon} className="h-6 w-6" />
        </span>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={onToggle}>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{title}</span>
            <span className="block truncate text-[13px] leading-[18px] text-gosi-midnight-50">{summary}</span>
          </span>
          <ChevronDown size={18} strokeWidth={1.75} className={`shrink-0 text-gosi-midnight-50 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button type="button" className="text-[15px] font-semibold text-gosi-blue" onClick={onEdit}>{copy.wizard.edit}</button>
      </div>
      {open && <div className="border-t border-gosi-midnight-10 px-4 py-3">{children}</div>}
    </section>
  );
}

export function ReviewStep({
  shown,
  discipline,
  languages,
  intro,
  specializations,
  documents,
  offers,
  serviceTypes,
  agreed,
  onEdit,
  onAgree,
}: {
  shown: string[];
  discipline: string;
  languages: string[];
  intro: string;
  specializations: string;
  documents: { id: string; file_name: string; kind?: string }[];
  offers: { serviceTypeId: string; description: string }[];
  serviceTypes: ServiceType[];
  agreed: boolean;
  onEdit: (step: number) => void;
  onAgree: (agreed: boolean) => void;
}) {
  const [open, setOpen] = useState("record");
  const [terms, setTerms] = useState(false);
  const [read, setRead] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!terms) return;
    const node = scroller.current;
    if (node && node.scrollHeight <= node.clientHeight + 12) setRead(true);
  }, [terms]);
  const chips = specializations.split(",").map((item) => item.trim()).filter(Boolean);
  const toggle = (id: string) => setOpen(open === id ? "" : id);
  const fileSummary = documents.length ? `${documents.length} ${documents.length === 1 ? copy.wizard.oneFile : copy.wizard.files}` : copy.wizard.notAdded;
  const serviceSummary = offers.length ? `${offers.length} ${offers.length === 1 ? copy.wizard.serviceSelected : copy.wizard.servicesSelected}` : copy.wizard.notAdded;
  return (
    <div className="space-y-3">
      <StepHeading title={copy.wizard.reviewTitle} subtitle={copy.wizard.reviewSubtitle} />
      <SummaryCard icon="security" title={copy.wizard.yourRecord} summary={shown.join(", ") || copy.wizard.recordOnly} open={open === "record"} onToggle={() => toggle("record")} onEdit={() => onEdit(1)}>
        {shown.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shown.map((item) => <Chip key={item}>{item}</Chip>)}
          </div>
        )}
        <p className={`${shown.length ? "mt-3" : ""} text-[13px] leading-[18px] text-gosi-midnight-50`}>{copy.wizard.alwaysShown}</p>
      </SummaryCard>
      <SummaryCard icon="individual-m" title={copy.wizard.background} summary={[discipline, languages.join(", ")].filter(Boolean).join(" · ") || copy.wizard.notAdded} open={open === "background"} onToggle={() => toggle("background")} onEdit={() => onEdit(2)}>
        {discipline || languages.length || intro || chips.length ? (
          <div className="space-y-3">
            {discipline && <p className="text-[15px] font-semibold">{discipline}</p>}
            {languages.length > 0 && <div className="flex flex-wrap gap-2">{languages.map((language) => <Chip key={language}>{language}</Chip>)}</div>}
            {intro && <p className="line-clamp-3 text-[13px] leading-[18px] text-gosi-midnight-80">{intro}</p>}
            {chips.length > 0 && <div className="flex flex-wrap gap-2">{chips.map((chip) => <Chip key={chip}>{chip}</Chip>)}</div>}
          </div>
        ) : <p className="text-[13px] leading-[18px] text-gosi-midnight-50">{copy.wizard.notAdded}</p>}
      </SummaryCard>
      <SummaryCard icon="certified-document" title={copy.wizard.documents} summary={fileSummary} open={open === "documents"} onToggle={() => toggle("documents")} onEdit={() => onEdit(3)}>
        {documents.length ? (
          <ul className="space-y-2">
            {documents.map((file) => (
              <li key={file.id} className="flex items-center gap-2">
                <BrandIcon name="certified-document" className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[15px]">{file.file_name}</span>
                {file.kind && <span className="text-[13px] text-gosi-midnight-50">{file.kind === "cv" ? copy.wizard.cv : copy.wizard.certificate}</span>}
              </li>
            ))}
          </ul>
        ) : <p className="text-[13px] leading-[18px] text-gosi-midnight-50">{copy.wizard.notAdded}</p>}
      </SummaryCard>
      <SummaryCard icon="partnership" title={copy.wizard.services} summary={serviceSummary} open={open === "services"} onToggle={() => toggle("services")} onEdit={() => onEdit(4)}>
        {offers.length ? (
          <ul className="space-y-3">
            {offers.map((offer) => {
              const type = serviceTypes.find((item) => item.id === offer.serviceTypeId);
              const line = offer.description.split("\n")[0];
              return (
                <li key={offer.serviceTypeId} className="flex gap-2">
                  <BrandIcon name={serviceIcons[offer.serviceTypeId] ?? "development"} className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold">{type?.name ?? offer.serviceTypeId}</span>
                    {line && <span className="line-clamp-2 text-[13px] leading-[18px] text-gosi-midnight-50">{line}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-[13px] leading-[18px] text-gosi-midnight-50">{copy.wizard.notAdded}</p>}
      </SummaryCard>
      <div data-field="terms" className="flex items-center gap-3 rounded-[20px] bg-white p-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={agreed}
          aria-label={copy.wizard.terms}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${agreed ? "border-gosi-vivid-green bg-gosi-vivid-green text-gosi-rich-blue" : "border-gosi-midnight-25 bg-white"}`}
          onClick={() => {
            if (agreed) onAgree(false);
            else { setTerms(true); setRead(false); }
          }}
        >
          {agreed && <Check size={14} strokeWidth={2.5} />}
        </button>
        <p className="min-w-0 flex-1 text-[15px] leading-[22px]">
          {copy.wizard.termsBefore}{" "}
          <button type="button" className="font-semibold text-gosi-blue" onClick={() => { setTerms(true); setRead(agreed); }}>{copy.wizard.termsLink}</button>
        </p>
      </div>
      {terms && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white text-gosi-rich-blue">
          <div className="flex h-14 items-center px-2">
            <button type="button" className="px-3 text-[15px] font-semibold text-gosi-blue" onClick={() => setTerms(false)}>{copy.wizard.back}</button>
            <p className="flex-1 text-center text-[15px] font-semibold">{copy.wizard.terms}</p>
            <span className="w-14" />
          </div>
          <div
            ref={scroller}
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 text-[15px] leading-[22px]"
            onScroll={(event) => {
              const node = event.currentTarget;
              if (node.scrollTop + node.clientHeight >= node.scrollHeight - 12) setRead(true);
            }}
          >
            <p>{copy.termsBody}</p>
          </div>
          <div className="border-t border-gosi-midnight-10 px-5 py-3">
            <button
              type="button"
              className={`h-[52px] w-full rounded-full text-[15px] font-semibold ${read ? "bg-gosi-vivid-green text-gosi-rich-blue" : "bg-gosi-midnight-25 text-gosi-midnight-50"}`}
              onClick={() => { if (!read) return; onAgree(true); setTerms(false); }}
            >
              {copy.wizard.agree}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
