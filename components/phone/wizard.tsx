"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDraftAction, submitAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/phone/ui/header";
import { Stepper } from "@/components/phone/ui/flow";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { DocUpload } from "@/components/phone/doc-upload";
import { pensionLabel, SeekerRecordPreview, type PreviewJob } from "@/components/phone/profile-preview";
import { copy } from "@/lib/copy";
import { formatSpan } from "@/lib/format";
import { LANGUAGES, type Category, type ServiceType } from "@/lib/types";

type Offer = { serviceTypeId: string; description: string };

export function Choice({ checked, label, hint, onChange }: { checked: boolean; label: string; hint: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="block rounded-2xl bg-white p-3 text-sm">
      <span className="flex gap-2 font-medium"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</span>
      <span className="mt-1 block pl-6 text-[13px] text-gosi-midnight-80">{hint}</span>
    </label>
  );
}

export function Wizard({
  personaId,
  personId,
  initialStep,
  record,
  jobs,
  documents,
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
  initial: { showEmployers: boolean; showDates: boolean; showSector: boolean; discipline: string; specializations: string; intro: string; languages: string[]; offers: Offer[] };
  categories: Category[];
  serviceTypes: ServiceType[];
}) {
  const [step, setStep] = useState(initialStep || 1);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [moreLanguages, setMoreLanguages] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const fillExample = (kind: "teacher" | "accountant") => {
    const teacher = kind === "teacher";
    setForm((current) => ({
      ...current,
      discipline: current.discipline || (teacher ? "Secondary school English teacher" : "Accountant"),
      intro: current.intro || (teacher ? "I taught English for many years. I can help you practice speaking." : "I worked in accounting for many years. I can walk you through the basics."),
      languages: current.languages.length ? current.languages : ["Arabic", "English"],
    }));
  };

  const save = (next: number) => {
    start(async () => {
      const result = await saveDraftAction(personId, { step: next, showEmployers: form.showEmployers, showDates: form.showDates, showSector: form.showSector, disciplineRole: form.discipline, specializations: form.specializations, intro: form.intro, languages: form.languages, offerings: form.offers });
      if (!result.ok) setError(result.error);
      else {
        setStep(next);
        setSaved(true);
        setError(null);
        router.refresh();
      }
    });
  };

  if (submitted) {
    return (
      <div className="space-y-4 px-5 py-8 text-gosi-rich-blue">
        <h1 className="text-[28px] font-bold">Application submitted</h1>
        <p>GOSI reviews each service and notifies you in the app. Then you watch a short guide, test your call, and set your hours.</p>
        <Button onClick={() => router.push(`/phone/${personaId}/home`)}>Back to home</Button>
        <Button variant="secondary" onClick={() => router.push(`/phone/${personaId}/opportunities/retiree/status`)}>View status</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 py-2 text-gosi-rich-blue">
      <AppHeader title="Your application" />
      <Stepper step={step} total={5} label={copy.applySteps[step - 1]} />
      {saved && <p className="text-[13px] text-gosi-midnight-50">Saved</p>}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm">{copy.applyIntro}</p>
          <div className="space-y-2 rounded-3xl bg-white p-4 text-sm">
            <p className="text-xs">{copy.verified}</p>
            <p className="text-lg font-medium">{record.name}</p>
            <p>Confirmed retiree · {pensionLabel(record.pension)}</p>
            <p>{record.years} years of experience · last active {record.lastActive}</p>
            {jobs.map((job) => (
              <p key={job.id}>{job.employer} · {job.sector} · {formatSpan(job.start_date, job.end_date)}</p>
            ))}
            <p className="text-[13px] text-gosi-midnight-80">{copy.applyRecordNote}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">{copy.applyChoiceNote}</p>
            <Choice checked={form.showEmployers} label={copy.showEmployers} hint={copy.showEmployersHint} onChange={(checked) => setForm({ ...form, showEmployers: checked })} />
            <Choice checked={form.showDates} label={copy.showDates} hint={copy.showDatesHint} onChange={(checked) => setForm({ ...form, showDates: checked })} />
            <Choice checked={form.showSector} label={copy.showSector} hint={copy.showSectorHint} onChange={(checked) => setForm({ ...form, showSector: checked })} />
          </div>
          <SeekerRecordPreview name={record.name} pension={record.pension} years={record.years} lastActive={record.lastActive} jobs={jobs} showEmployers={form.showEmployers} showDates={form.showDates} showSector={form.showSector} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm">{copy.backgroundIntro}</p>
          <p className="text-[13px] text-gosi-midnight-80">{copy.examplePrompt}</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => fillExample("teacher")}>{copy.exampleTeacher}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => fillExample("accountant")}>{copy.exampleAccountant}</Button>
          </div>
          <Field label={copy.jobLabel}><TextInput value={form.discipline} placeholder={copy.jobPlaceholder} onChange={(e) => setForm({ ...form, discipline: e.target.value })} /></Field>
          <p className="text-[13px] text-gosi-midnight-80">{copy.offerNote}</p>
          <Field label={copy.introLabel}><TextArea className="min-h-16" value={form.intro} placeholder={copy.introPlaceholder} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></Field>
          <div>
            <p className="text-sm font-medium">{copy.languageLabel}</p>
            <p className="text-[13px] text-gosi-midnight-80">{copy.languageHint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.filter((language) => moreLanguages || language === "Arabic" || language === "English" || form.languages.includes(language)).map((language) => {
                const on = form.languages.includes(language);
                return (
                  <button key={language} type="button" className={`rounded-full px-3 py-1 ${on ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setForm({ ...form, languages: on ? form.languages.filter((item) => item !== language) : [...form.languages, language] })}>
                    {language}
                  </button>
                );
              })}
              <button type="button" className="rounded-full px-3 py-1 text-gosi-blue" onClick={() => setMoreLanguages((open) => !open)}>{moreLanguages ? copy.fewerLanguages : copy.moreLanguages}</button>
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm">{copy.uploadDocsNote}</p>
          <DocUpload personId={personId} kind="cv" title={copy.uploadCvTitle} button={copy.uploadCv} files={documents} />
          <DocUpload personId={personId} kind="certificate" title={copy.uploadCertTitle} button={copy.uploadCert} files={documents} />
        </div>
      )}
      {step === 4 && (
        <div className="space-y-3">
          <p className="text-sm">{copy.servicePickNote}</p>
          {categories.map((category) => (
            <div key={category.id} className="rounded-3xl bg-white p-4">
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-gosi-midnight-50" dir="rtl">{category.name_ar}</p>
              {serviceTypes.filter((type) => type.category_id === category.id).map((type) => {
                const offer = form.offers.find((row) => row.serviceTypeId === type.id);
                return (
                  <div key={type.id} className="mt-3">
                    <label className="flex gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(offer)} onChange={(e) => setForm({ ...form, offers: e.target.checked ? [...form.offers, { serviceTypeId: type.id, description: offer?.description ?? "" }] : form.offers.filter((row) => row.serviceTypeId !== type.id) })} />
                      {type.name}
                    </label>
                    {offer && (
                      <TextArea placeholder={copy.descriptionPlaceholder} value={offer.description} onChange={(e) => setForm({ ...form, offers: form.offers.map((row) => row.serviceTypeId === type.id ? { ...row, description: e.target.value } : row) })} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {step === 5 && (
        <div className="space-y-3 rounded-3xl bg-white p-4 text-sm">
          <div>
            <p className="font-medium">{copy.profilePreview}</p>
            <p className="mt-1 text-[13px] text-gosi-midnight-80">{copy.profilePreviewNote}</p>
          </div>
          <SeekerRecordPreview name={record.name} pension={record.pension} years={record.years} lastActive={record.lastActive} jobs={jobs} showEmployers={form.showEmployers} showDates={form.showDates} showSector={form.showSector} />
          <p>{form.discipline || "Your role"}</p>
          <p>{form.intro}</p>
          <p>{form.languages.join(", ")}</p>
          <ul className="list-disc pl-4">
            {form.offers.map((offer) => <li key={offer.serviceTypeId}>{serviceTypes.find((type) => type.id === offer.serviceTypeId)?.name}</li>)}
          </ul>
          <div className="max-h-32 overflow-y-auto text-xs">{copy.termsBody}</div>
          <label className="flex gap-2"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />{copy.termsLabel}</label>
          <Button disabled={pending || !agreed} onClick={() => start(async () => { const saved = await saveDraftAction(personId, { step: 5, disciplineRole: form.discipline, specializations: form.specializations, intro: form.intro, languages: form.languages, offerings: form.offers }); if (!saved.ok) return setError(saved.error); const result = await submitAction(personId, personaId); if (!result.ok) setError(result.error); else setSubmitted(true); })}>Submit for review</Button>
        </div>
      )}
      {error && <p>{error}</p>}
      <div className="flex gap-2">
        {step > 1 && <Button variant="secondary" size="md" disabled={pending} onClick={() => save(step - 1)}>Back</Button>}
        {step < 5 && <Button size="md" disabled={pending} onClick={() => save(step + 1)}>Save and continue</Button>}
      </div>
    </div>
  );
}
