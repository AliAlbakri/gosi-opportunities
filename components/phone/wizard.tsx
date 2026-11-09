"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDraftAction, submitAction, uploadPhotoAction } from "@/app/actions/flow";
import { BottomSheet, Timeline } from "@/components/phone/ui/flow";
import { PrimaryButton, TextButton } from "@/components/phone/ui/buttons";
import { WizardActions, WizardLayout, markInvalid } from "@/components/phone/wizard-layout";
import { RecordStep } from "@/components/phone/wizard-record";
import { BackgroundStep } from "@/components/phone/wizard-background";
import { DocumentsStep } from "@/components/phone/wizard-documents";
import { ServicesStep } from "@/components/phone/wizard-services";
import { ReviewStep } from "@/components/phone/wizard-review";
import { copy } from "@/lib/copy";
import type { PreviewJob } from "@/components/phone/profile-preview";
import type { Category, ServiceType } from "@/lib/types";

type Offer = { serviceTypeId: string; description: string };
type Form = { showEmployers: boolean; showDates: boolean; showSector: boolean; discipline: string; specializations: string; intro: string; languages: string[]; offers: Offer[] };

export function Wizard({
  personaId,
  personId,
  initialStep,
  record,
  jobs,
  documents,
  photoUrl,
  initial,
  categories,
  serviceTypes,
}: {
  personaId: string;
  personId: string;
  initialStep: number;
  record: { name: string; pension: string; years: number; lastActive: string };
  jobs: PreviewJob[];
  documents: { id: string; kind: string; file_name: string }[];
  photoUrl: string | null;
  initial: Form;
  categories: Category[];
  serviceTypes: ServiceType[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep || 1);
  const [form, setForm] = useState(initial);
  const [picked, setPicked] = useState<string[]>(() => [...new Set(initial.offers.map((offer) => serviceTypes.find((type) => type.id === offer.serviceTypeId)?.category_id).filter((id): id is string => Boolean(id)))]);
  const [photo, setPhoto] = useState(photoUrl);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const payload = (next: number) => ({
    step: next,
    showEmployers: form.showEmployers,
    showDates: form.showDates,
    showSector: form.showSector,
    disciplineRole: form.discipline,
    specializations: form.specializations,
    intro: form.intro,
    languages: form.languages,
    offerings: form.offers,
  });

  const problem = () => {
    if (step === 2 && !form.discipline.trim()) return "role";
    if (step === 2 && !form.languages.length) return "languages";
    if (step === 4 && !form.offers.length) return "categories";
    if (step === 4) {
      const short = form.offers.find((offer) => { const length = offer.description.trim().length; return length < 80 || length > 800; });
      if (short) return short.serviceTypeId;
    }
    if (step === 5 && !agreed) return "terms";
    return null;
  };

  const go = (next: number) => {
    if (pending) return;
    const block = problem();
    if (block && next > step) {
      setInvalid(block);
      markInvalid(block);
      return;
    }
    start(async () => {
      const result = await saveDraftAction(personId, payload(next === 6 ? 5 : next));
      if (!result.ok) return setError(result.error);
      setSaved(true);
      setError(null);
      setInvalid(null);
      setReturnTo(null);
      setStep(next);
      router.refresh();
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-full flex-col items-center px-5 py-10 text-center text-gosi-rich-blue">
        <img src="/brand/illustrations/illustration-01.png" alt="" className="h-40 w-40 object-contain" />
        <h1 className="mt-4 text-[22px] font-semibold leading-7">{copy.wizard.successTitle}</h1>
        <p className="mt-2 text-[15px] leading-[22px] text-gosi-midnight-50">{copy.wizard.successBody}</p>
        <div className="mt-6 w-full rounded-[20px] bg-white p-4 text-left">
          <Timeline items={[{ title: copy.wizard.successReview, state: "current" }, { title: copy.wizard.successNotify, state: "upcoming" }, { title: copy.wizard.successReady, state: "upcoming" }]} />
        </div>
        <PrimaryButton className="mt-6 w-full" onClick={() => router.push(`/phone/${personaId}/opportunities/retiree/status`)}>{copy.wizard.viewStatus}</PrimaryButton>
        <TextButton className="mt-2" onClick={() => router.push(`/phone/${personaId}/home`)}>{copy.wizard.home}</TextButton>
      </div>
    );
  }

  const count = form.offers.length;
  const primary = step === 5 ? copy.wizard.submit : step === 3 && documents.length === 0 ? copy.wizard.skip : copy.wizard.continue;
  const blocked = Boolean(problem());
  return (
    <>
      <WizardLayout
        step={step}
        saved={saved}
        onClose={() => start(async () => { const result = await saveDraftAction(personId, payload(step)); if (!result.ok) return setError(result.error); setSaved(true); setLeaving(true); })}
        footer={
          <WizardActions
            back={step > 1}
            primary={primary}
            disabledLook={blocked || pending}
            note={step === 4 ? `${count} ${count === 1 ? copy.wizard.serviceSelected : copy.wizard.servicesSelected}` : undefined}
            onBack={() => go(step - 1)}
            onPrimary={() => {
              if (step === 5 && !problem()) {
                start(async () => {
                  const savedDraft = await saveDraftAction(personId, payload(5));
                  if (!savedDraft.ok) return setError(savedDraft.error);
                  const result = await submitAction(personId, personaId);
                  if (!result.ok) setError(result.error);
                  else setSubmitted(true);
                });
                return;
              }
              go(returnTo ?? step + 1);
            }}
          />
        }
      >
        {step === 1 && <RecordStep record={record} jobs={jobs} showEmployers={form.showEmployers} showDates={form.showDates} showSector={form.showSector} onChange={(patch) => setForm({ ...form, ...patch })} />}
        {step === 2 && (
          <BackgroundStep
            name={record.name}
            photoUrl={photo}
            discipline={form.discipline}
            languages={form.languages}
            intro={form.intro}
            specializations={form.specializations}
            invalid={invalid}
            onChange={(patch) => setForm({ ...form, ...patch })}
            onPhoto={(file) => {
              setPhoto(URL.createObjectURL(file));
              const data = new FormData();
              data.set("file", file);
              start(async () => {
                const result = await uploadPhotoAction(personId, data);
                if (result.ok) setPhoto(result.url);
                else setError(result.error);
              });
            }}
          />
        )}
        {step === 3 && <DocumentsStep personId={personId} files={documents} sizes={sizes} onDone={(name, size) => { if (size) setSizes((current) => ({ ...current, [name]: size })); router.refresh(); }} />}
        {step === 4 && (
          <ServicesStep
            categories={categories}
            serviceTypes={serviceTypes}
            offers={form.offers}
            selected={picked}
            invalid={invalid}
            onSelectCategory={(id) => {
              setPicked((current) => {
                if (!current.includes(id)) return [...current, id];
                const drop = new Set(serviceTypes.filter((type) => type.category_id === id).map((type) => type.id));
                setForm((currentForm) => ({ ...currentForm, offers: currentForm.offers.filter((offer) => !drop.has(offer.serviceTypeId)) }));
                return current.filter((item) => item !== id);
              });
            }}
            onToggle={(id) => setForm({ ...form, offers: form.offers.some((offer) => offer.serviceTypeId === id) ? form.offers.filter((offer) => offer.serviceTypeId !== id) : [...form.offers, { serviceTypeId: id, description: "" }] })}
            onDescribe={(id, description) => setForm({ ...form, offers: form.offers.map((offer) => offer.serviceTypeId === id ? { ...offer, description } : offer) })}
          />
        )}
        {step === 5 && (
          <ReviewStep
            shown={[form.showEmployers ? copy.wizard.showEmployers : "", form.showDates ? copy.wizard.showDates : "", form.showSector ? copy.wizard.showSector : ""].filter(Boolean)}
            discipline={form.discipline}
            languages={form.languages}
            intro={form.intro}
            specializations={form.specializations}
            documents={documents}
            offers={form.offers}
            serviceTypes={serviceTypes}
            agreed={agreed}
            onEdit={(target) => { setReturnTo(5); setStep(target); }}
            onAgree={() => setAgreed(true)}
          />
        )}
        {error && <p className="text-[13px] text-gosi-midnight-50">{error}</p>}
      </WizardLayout>
      <BottomSheet title={copy.wizard.savedSheet} open={leaving} onClose={() => setLeaving(false)}>
        <PrimaryButton className="w-full" onClick={() => router.push(`/phone/${personaId}/home`)}>{copy.wizard.home}</PrimaryButton>
      </BottomSheet>
    </>
  );
}
