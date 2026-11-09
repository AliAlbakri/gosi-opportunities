"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDraftAction, submitAction, uploadAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/phone/ui/header";
import { Stepper } from "@/components/phone/ui/flow";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { copy } from "@/lib/copy";
import { LANGUAGES, type Category, type ServiceType } from "@/lib/types";

type Offer = { serviceTypeId: string; description: string };

export function Wizard({
  personaId,
  personId,
  initialStep,
  record,
  initial,
  categories,
  serviceTypes,
}: {
  personaId: string;
  personId: string;
  initialStep: number;
  record: { name: string; pension: string; years: number; employers: string; lastActive: string };
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
  const [pending, start] = useTransition();
  const router = useRouter();

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
      {step === 1 && <p className="text-sm">{copy.applyIntro}</p>}
      {step === 1 && (
        <div className="space-y-3 rounded-3xl bg-white p-4">
          <p className="text-xs">{copy.verified}</p>
          <p className="text-lg font-medium">{record.name}</p>
          <p>Confirmed retiree · {record.pension}</p>
          <p>{record.years} years of experience · last active {record.lastActive}</p>
          <p className="text-sm">{record.employers}</p>
          <label className="flex gap-2"><input type="checkbox" checked={form.showEmployers} onChange={(e) => setForm({ ...form, showEmployers: e.target.checked })} /> Show employers</label>
          <label className="flex gap-2"><input type="checkbox" checked={form.showDates} onChange={(e) => setForm({ ...form, showDates: e.target.checked })} /> Show dates</label>
          <label className="flex gap-2"><input type="checkbox" checked={form.showSector} onChange={(e) => setForm({ ...form, showSector: e.target.checked })} /> Show sector</label>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-xs">{copy.selfDeclared}</p>
          <Field label="Professional discipline and role"><TextInput value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} /></Field>
          <Field label="Specializations"><TextArea value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} /></Field>
          <Field label="Personal introduction"><TextArea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => {
              const on = form.languages.includes(language);
              return (
                <button key={language} type="button" className={`rounded-full px-3 py-1 ${on ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setForm({ ...form, languages: on ? form.languages.filter((item) => item !== language) : [...form.languages, language] })}>
                  {language}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {step === 3 && (
        <form action={(data) => start(async () => { const result = await uploadAction(personId, "cv", data); setError(result.ok ? null : result.error); router.refresh(); })} className="space-y-3 rounded-3xl bg-white p-4">
          <p>CV (one file) and certificates. PDF, JPG, or PNG up to 10 MB.</p>
          <input name="file" type="file" accept="application/pdf,image/jpeg,image/png" />
          <Button size="md" type="submit">Upload CV</Button>
        </form>
      )}
      {step === 3 && (
        <form action={(data) => start(async () => { const result = await uploadAction(personId, "certificate", data); setError(result.ok ? null : result.error); router.refresh(); })} className="space-y-3 rounded-3xl bg-white p-4">
          <p>Certificates, if you have them.</p>
          <input name="file" type="file" accept="application/pdf,image/jpeg,image/png" />
          <Button size="md" variant="secondary" type="submit">Upload certificate</Button>
        </form>
      )}
      {step === 4 && (
        <div className="space-y-3">
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
          <p>{form.discipline}</p>
          <p>{form.languages.join(", ")}</p>
          <p>{form.offers.length} Service Types</p>
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
