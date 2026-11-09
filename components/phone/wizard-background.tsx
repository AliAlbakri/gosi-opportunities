"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { FieldBlock, InfoButton, StepHeading, useFilePicker } from "@/components/phone/wizard-layout";
import { TextArea, TextInput } from "@/components/ui/fields";
import { copy } from "@/lib/copy";
import { LANGUAGES } from "@/lib/types";

export function BackgroundStep({
  name,
  photoUrl,
  discipline,
  languages,
  intro,
  specializations,
  invalid,
  onChange,
  onPhoto,
}: {
  name: string;
  photoUrl: string | null;
  discipline: string;
  languages: string[];
  intro: string;
  specializations: string;
  invalid: string | null;
  onChange: (patch: Partial<{ discipline: string; languages: string[]; intro: string; specializations: string }>) => void;
  onPhoto: (file: File) => void;
}) {
  const [draft, setDraft] = useState("");
  const chips = specializations.split(",").map((item) => item.trim()).filter(Boolean);
  const letters = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  const picker = useFilePicker("image/jpeg,image/png,.jpg,.jpeg,.png", false, (files) => onPhoto(files[0]));
  const addChip = () => {
    const next = draft.trim();
    if (!next || chips.some((chip) => chip.toLowerCase() === next.toLowerCase())) return;
    onChange({ specializations: [...chips, next].join(", ") });
    setDraft("");
  };
  return (
    <div className="space-y-6">
      {picker.input}
      <StepHeading title={copy.wizard.backgroundTitle} subtitle={copy.wizard.backgroundSubtitle} />
      <div className="flex flex-col items-center">
        <button type="button" className="relative" aria-label={copy.wizard.photo} onClick={picker.open}>
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-[88px] w-[88px] rounded-full object-cover" />
          ) : (
            <span className="grid h-[88px] w-[88px] place-items-center rounded-full bg-gradient-to-br from-gosi-rich-blue to-gosi-blue text-2xl font-semibold text-white">{letters}</span>
          )}
          <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-white text-gosi-rich-blue shadow">
            <Camera size={16} />
          </span>
        </button>
        <span className="mt-2 rounded-full bg-gosi-midnight-10 px-2 py-0.5 text-[11px] leading-[14px] text-gosi-midnight-50">{copy.wizard.optional}</span>
      </div>
      <FieldBlock id="role" label={copy.wizard.role} invalid={invalid === "role"}>
        <TextInput value={discipline} placeholder={copy.wizard.rolePlaceholder} onChange={(event) => onChange({ discipline: event.target.value })} />
      </FieldBlock>
      <FieldBlock id="languages" label={copy.wizard.languages} invalid={invalid === "languages"}>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((language) => {
            const on = languages.includes(language);
            return (
              <button key={language} type="button" className={`h-11 rounded-full px-4 text-[13px] font-semibold ${on ? "bg-gosi-rich-blue text-white" : "bg-white"}`} onClick={() => onChange({ languages: on ? languages.filter((item) => item !== language) : [...languages, language] })}>
                {language}
              </button>
            );
          })}
        </div>
      </FieldBlock>
      <FieldBlock label={copy.wizard.intro} optional>
        <TextArea maxLength={500} className="min-h-24" value={intro} placeholder={copy.wizard.introPlaceholder} onChange={(event) => onChange({ intro: event.target.value.slice(0, 500) })} />
        <p className="mt-1 text-right text-[13px] text-gosi-midnight-50">{intro.length}/500</p>
      </FieldBlock>
      <FieldBlock label={copy.wizard.specializations} optional>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button key={chip} type="button" className="rounded-full bg-gosi-green-10 px-3 py-1 text-[13px] font-semibold" onClick={() => onChange({ specializations: chips.filter((item) => item !== chip).join(", ") })}>
              {chip} ×
            </button>
          ))}
        </div>
        <TextInput className="mt-2" value={draft} placeholder={copy.wizard.specializationPlaceholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addChip(); } }} />
      </FieldBlock>
      <p className="flex items-center gap-2 text-[13px] leading-[18px] text-gosi-midnight-50">
        {copy.wizard.selfDeclared}
        <InfoButton title={copy.wizard.selfDeclared} body={copy.wizard.selfDeclaredSheet} />
      </p>
    </div>
  );
}
