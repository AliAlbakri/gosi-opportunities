"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, Info, X } from "lucide-react";
import { BottomSheet } from "@/components/phone/ui/flow";
import { PrimaryButton, SecondaryButton } from "@/components/phone/ui/buttons";
import { copy } from "@/lib/copy";

export function WizardLayout({
  step,
  saved,
  onClose,
  footer,
  children,
}: {
  step: number;
  saved: boolean;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  const name = copy.applySteps[step - 1];
  return (
    <div className="flex min-h-full flex-col text-gosi-rich-blue">
      <header className="sticky top-0 z-20 bg-white">
        <div className="flex h-14 items-center px-2">
          <button type="button" aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-gosi-midnight-10" onClick={onClose}>
            <X size={20} strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-semibold">{copy.wizard.application}</h1>
          <span className={`flex w-16 items-center justify-end gap-1 pr-2 text-[13px] font-semibold text-gosi-rich-blue transition-opacity duration-300 ${saved ? "opacity-100" : "opacity-0"}`}>
            <Check size={14} className="text-[#14804A]" strokeWidth={2.5} />
            {copy.wizard.saved}
          </span>
        </div>
        <div className="px-5 pb-3">
          <div className="flex gap-1">
            {copy.applySteps.map((label, index) => (
              <span key={label} className={`h-1 flex-1 rounded-full ${index <= step - 1 ? "bg-gosi-vivid-green" : "bg-gosi-midnight-25"}`} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] leading-[14px] text-gosi-midnight-50">
            <span>{copy.wizard.stepOf} {step} of 5</span>
            <span>{name}</span>
          </div>
        </div>
      </header>
      <div className="flex-1 space-y-6 px-5 pb-28 pt-4">{children}</div>
      <div className="sticky bottom-0 z-20 border-t border-gosi-midnight-10 bg-white px-5 pb-6 pt-3">{footer}</div>
    </div>
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold leading-7">{title}</h2>
      <p className="mt-1 text-[15px] leading-[22px] text-gosi-midnight-50">{subtitle}</p>
    </div>
  );
}

export function InfoButton({ title, body, light = false }: { title: string; body: string; light?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-label={title} className={`grid h-8 w-8 place-items-center rounded-full ${light ? "bg-white/15 text-white" : "bg-gosi-midnight-10 text-gosi-rich-blue"}`} onClick={() => setOpen(true)}>
        <Info size={16} />
      </button>
      <BottomSheet title={title} open={open} onClose={() => setOpen(false)}>
        <p className="text-[15px] leading-[22px]">{body}</p>
      </BottomSheet>
    </>
  );
}

export function SwitchRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onChange(!checked)}>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-[22px]">{label}</span>
        <span className="block text-[13px] leading-[18px] text-gosi-midnight-50">{hint}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${checked ? "bg-gosi-vivid-green" : "bg-gosi-midnight-25"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export function FieldBlock({ id, label, optional, helper, invalid, children }: { id?: string; label: string; optional?: boolean; helper?: string; invalid?: boolean; children: ReactNode }) {
  return (
    <div data-field={id} className={invalid ? "rounded-2xl ring-2 ring-gosi-blue ring-offset-2" : ""}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[15px] font-semibold leading-[22px]">{label}</span>
        {optional && <span className="rounded-full bg-gosi-midnight-10 px-2 py-0.5 text-[11px] leading-[14px] text-gosi-midnight-50">{copy.wizard.optional}</span>}
      </div>
      {children}
      {helper && <p className="mt-1 text-[13px] leading-[18px] text-gosi-midnight-50">{helper}</p>}
    </div>
  );
}

export function WizardActions({ back, primary, disabledLook, note, onBack, onPrimary }: { back?: boolean; primary: string; disabledLook?: boolean; note?: string; onBack?: () => void; onPrimary: () => void }) {
  return (
    <div>
      {note && <p className="mb-2 text-center text-[13px] leading-[18px] text-gosi-midnight-50">{note}</p>}
      <div className="flex gap-2">
        {back && <SecondaryButton className="px-6" onClick={onBack}>{copy.wizard.back}</SecondaryButton>}
        <PrimaryButton className={`flex-1 ${disabledLook ? "!bg-gosi-midnight-25 !text-gosi-midnight-50" : ""}`} onClick={onPrimary}>{primary}</PrimaryButton>
      </div>
    </div>
  );
}

export function useFilePicker(accept: string, multiple: boolean, onFiles: (files: File[]) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const input = mounted
    ? createPortal(
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          className="fixed top-0 h-px w-px opacity-[0.01]"
          style={{ left: "-10000px" }}
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            if (files.length) onFiles(files);
            event.target.value = "";
          }}
        />,
        document.body,
      )
    : null;
  return { input, open: () => ref.current?.click() };
}

export function markInvalid(id: string) {
  const node = document.querySelector(`[data-field="${id}"]`);
  node?.scrollIntoView({ block: "center", behavior: "smooth" });
}
