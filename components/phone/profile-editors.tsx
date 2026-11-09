"use client";

import { useState, useTransition } from "react";
import { addServiceAction, layer2Action } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { copy } from "@/lib/copy";
import { LANGUAGES } from "@/lib/types";

export function Layer2Editor({
  personId,
  personaId,
  initial,
}: {
  personId: string;
  personaId: string;
  initial: { discipline: string; specializations: string; intro: string; languages: string[] };
}) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2 rounded-3xl bg-white p-4">
      <h2 className="text-gosi-blue">Edit what you declared</h2>
      <Field label="What was your job?"><TextInput value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} /></Field>
      <Field label="A short introduction"><TextArea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></Field>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((language) => {
          const on = form.languages.includes(language);
          return (
            <button key={language} type="button" className={`rounded-full px-3 py-1 text-sm ${on ? "bg-gosi-green-10" : "bg-gosi-midnight-10"}`} onClick={() => setForm({ ...form, languages: on ? form.languages.filter((item) => item !== language) : [...form.languages, language] })}>
              {language}
            </button>
          );
        })}
      </div>
      <Button size="sm" disabled={pending} onClick={() => start(async () => {
        const result = await layer2Action(personId, personaId, { disciplineRole: form.discipline, specializations: form.specializations, intro: form.intro, languages: form.languages });
        setMessage(result.ok ? "Saved" : result.error);
      })}>Save profile</Button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}

export function AddServiceForm({ personId, personaId, types }: { personId: string; personaId: string; types: { id: string; name: string }[] }) {
  const [serviceTypeId, setServiceTypeId] = useState(types[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!types.length) return null;
  return (
    <div className="space-y-2 rounded-3xl bg-white p-4">
      <h2 className="text-gosi-blue">Add a Service Type</h2>
      <select className="h-10 w-full rounded-xl border px-2" value={serviceTypeId} onChange={(e) => setServiceTypeId(e.target.value)}>
        {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
      </select>
      <TextArea placeholder={copy.descriptionPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Button size="sm" disabled={pending} onClick={() => start(async () => {
        const result = await addServiceAction(personId, personaId, serviceTypeId, description);
        setMessage(result.ok ? "Sent for review." : result.error);
      })}>Submit for review</Button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
