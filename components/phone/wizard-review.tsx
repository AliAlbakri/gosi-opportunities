"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";
import { StepHeading } from "@/components/phone/wizard-layout";
import type { ServiceType } from "@/lib/types";

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
  documents: { id: string; file_name: string }[];
  offers: { serviceTypeId: string; description: string }[];
  serviceTypes: ServiceType[];
  agreed: boolean;
  onEdit: (step: number) => void;
  onAgree: () => void;
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
  const cards = [
    { id: "record", step: 1, title: copy.wizard.yourRecord, body: shown.length ? shown.join("\n") : copy.wizard.none },
    { id: "background", step: 2, title: copy.wizard.background, body: [discipline, ...languages, intro.split("\n")[0], ...chips].filter(Boolean).join("\n") || copy.wizard.none },
    { id: "documents", step: 3, title: copy.wizard.documents, body: documents.map((file) => file.file_name).join("\n") || copy.wizard.none },
    { id: "services", step: 4, title: copy.wizard.services, body: offers.map((offer) => { const name = serviceTypes.find((type) => type.id === offer.serviceTypeId)?.name ?? offer.serviceTypeId; const line = offer.description.split("\n")[0]; return line ? `${name}\n${line}` : name; }).join("\n\n") || copy.wizard.none },
  ];
  return (
    <div className="space-y-6">
      <StepHeading title={copy.wizard.reviewTitle} subtitle={copy.wizard.reviewSubtitle} />
      {cards.map((card) => {
        const expanded = open === card.id;
        return (
          <section key={card.id} className="rounded-[20px] bg-white p-4">
            <div className="flex items-center gap-2">
              <button type="button" className="min-w-0 flex-1 text-left text-[15px] font-semibold" onClick={() => setOpen(expanded ? "" : card.id)}>{card.title}</button>
              <button type="button" className="text-[15px] font-semibold text-gosi-blue" onClick={() => onEdit(card.step)}>{copy.wizard.edit}</button>
            </div>
            {expanded && <p className="mt-2 whitespace-pre-line text-[15px] leading-[22px] text-gosi-midnight-50">{card.body}</p>}
          </section>
        );
      })}
      <button type="button" data-field="terms" className="flex w-full items-center gap-3 rounded-[20px] bg-white p-4 text-left" onClick={() => { setTerms(true); setRead(false); }}>
        <BrandIcon name="certified-document" className="h-8 w-8" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{copy.wizard.terms}</span>
          <span className="text-[13px] text-gosi-midnight-50">{agreed ? copy.wizard.agreed : copy.wizard.termsStatus}</span>
        </span>
        {agreed ? <Check size={18} className="text-[#14804A]" /> : <ChevronRight size={18} />}
      </button>
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
              onClick={() => { if (!read) return; onAgree(); setTerms(false); }}
            >
              {copy.wizard.agree}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
