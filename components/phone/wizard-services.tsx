"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BrandIcon } from "@/components/phone/brand-icon";
import { BottomSheet } from "@/components/phone/ui/flow";
import { TextArea } from "@/components/ui/fields";
import { StepHeading } from "@/components/phone/wizard-layout";
import { copy } from "@/lib/copy";
import { coverFor, serviceIcons } from "@/lib/phone-icons";
import type { Category, ServiceType } from "@/lib/types";

type Offer = { serviceTypeId: string; description: string };

export function ServicesStep({
  categories,
  serviceTypes,
  offers,
  selected,
  invalid,
  onSelectCategory,
  onToggle,
  onDescribe,
}: {
  categories: Category[];
  serviceTypes: ServiceType[];
  offers: Offer[];
  selected: string[];
  invalid: string | null;
  onSelectCategory: (id: string) => void;
  onToggle: (id: string) => void;
  onDescribe: (id: string, description: string) => void;
}) {
  const [example, setExample] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <StepHeading title={copy.wizard.servicesTitle} subtitle={copy.wizard.servicesSubtitle} />
      <div data-field="categories" className={`grid grid-cols-2 gap-3 ${invalid === "categories" ? "rounded-2xl ring-2 ring-gosi-blue ring-offset-2" : ""}`}>
        {categories.map((category) => {
          const on = selected.includes(category.id);
          return (
            <button key={category.id} type="button" className={`overflow-hidden rounded-2xl bg-white text-left ${on ? "ring-2 ring-gosi-vivid-green" : ""}`} onClick={() => onSelectCategory(category.id)}>
              <img src={coverFor(category.id)} alt="" className="h-16 w-full object-cover" />
              <span className="block p-3 text-[13px] font-semibold leading-[18px]">{category.name}</span>
            </button>
          );
        })}
      </div>
      {categories.filter((category) => selected.includes(category.id)).map((category) => (
        <div key={category.id} className="space-y-3">
          {serviceTypes.filter((type) => type.category_id === category.id).map((type) => {
            const offer = offers.find((row) => row.serviceTypeId === type.id);
            const length = offer?.description.length ?? 0;
            return (
              <article key={type.id} data-field={type.id} className={`rounded-[20px] bg-white p-4 ${invalid === type.id ? "ring-2 ring-gosi-blue" : ""}`}>
                <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => onToggle(type.id)}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gosi-green-10">
                    <BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-6 w-6" />
                  </span>
                  <span className="flex-1 text-[15px] font-semibold leading-[22px]">{type.name}</span>
                  <span className={`grid h-6 w-6 place-items-center rounded-full border ${offer ? "border-gosi-vivid-green bg-gosi-vivid-green text-gosi-rich-blue" : "border-gosi-midnight-25"}`}>
                    {offer && <Check size={14} strokeWidth={2.5} />}
                  </span>
                </button>
                {offer && (
                  <div className="mt-3">
                    <p className="text-[15px] font-semibold">{copy.wizard.describe}</p>
                    <TextArea className="mt-1 min-h-24" maxLength={800} value={offer.description} onChange={(event) => onDescribe(type.id, event.target.value.slice(0, 800))} />
                    <div className="mt-1 flex items-center justify-between">
                      <button type="button" className="text-[15px] font-semibold text-gosi-blue" onClick={() => setExample(category.id === "accounting" ? copy.wizard.accountingExample : copy.wizard.educationExample)}>{copy.wizard.example}</button>
                      <span className={`text-[13px] ${length >= 80 ? "font-semibold text-[#14804A]" : "text-gosi-midnight-50"}`}>{length}/800</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-[18px] text-gosi-midnight-50">{copy.wizard.serviceHelper}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ))}
      <BottomSheet title={copy.wizard.exampleTitle} open={Boolean(example)} onClose={() => setExample(null)}>
        <p className="text-[15px] leading-[22px]">{example}</p>
      </BottomSheet>
    </div>
  );
}
