"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteOneAction, lookupInviteAction, previewWaveAction, sendWaveAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { copy } from "@/lib/copy";
import type { WavePreview, WaveStep } from "@/lib/types";

const selectClass = "h-11 w-full rounded-2xl border border-gosi-midnight-25 bg-white px-3";

const pensionLabel: Record<string, string> = {
  public: "Public",
  private: "Private",
  combined: "Combined (both systems)",
};

function stepLabel(step: WaveStep) {
  if (step.kind === "pool") return copy.wavePool;
  if (step.kind === "region") return `Region: ${step.value}`;
  if (step.kind === "sector") return `Sector: ${step.value}`;
  if (step.kind === "pension") return `Pension: ${step.value.split(", ").map((item) => pensionLabel[item] ?? item).join(", ")}`;
  return `At least ${step.value} years`;
}

function emptyReason(preview: WavePreview) {
  if (preview.steps[0]?.count === 0) return copy.waveEmptyAll;
  const dropped = preview.steps.find((step) => step.kind !== "pool" && step.count === 0);
  if (dropped?.kind === "pension" && dropped.value.includes("combined")) return copy.waveEmptyCombined;
  return copy.waveEmptyGeneric;
}

export function InvitationsPanel({ operatorId, regions, sectors }: { operatorId: string; regions: string[]; sectors: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("Riyadh English teachers");
  const [cap, setCap] = useState(5);
  const [minYears, setMinYears] = useState(0);
  const [region, setRegion] = useState("Riyadh");
  const [sector, setSector] = useState("Education");
  const [pension, setPension] = useState<"private" | "public" | "combined" | "">("private");
  const [preview, setPreview] = useState<WavePreview | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [match, setMatch] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const filters = {
    pensionSystems: pension ? [pension] : [],
    sectors: sector ? [sector] : [],
    regions: region ? [region] : [],
    minYears: Number.isFinite(minYears) && minYears > 0 ? minYears : 0,
    sizeCap: Number.isFinite(cap) && cap > 0 ? Math.round(cap) : 1,
  };

  useEffect(() => {
    let active = true;
    const payload = {
      pensionSystems: pension ? [pension] : [],
      sectors: sector ? [sector] : [],
      regions: region ? [region] : [],
      minYears: Number.isFinite(minYears) && minYears > 0 ? minYears : 0,
      sizeCap: Number.isFinite(cap) && cap > 0 ? Math.round(cap) : 1,
    };
    start(async () => {
      const result = await previewWaveAction(payload);
      if (!active) return;
      setPreview(result.ok ? result.preview : null);
      if (!result.ok) setMessage(result.error);
    });
    return () => {
      active = false;
    };
  }, [cap, minYears, region, sector, pension]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            const result = await sendWaveAction({ operatorId, name, ...filters });
            setMessage(result.ok ? `Sent ${result.sent}.` : result.error);
            if (result.ok) router.refresh();
          });
        }}
      >
        <div>
          <h2 className="text-xl text-gosi-blue">1. New wave</h2>
          <p className="mt-1 text-sm text-gosi-midnight-80">{copy.waveSteps[0]}</p>
        </div>
        <Field label="Wave name"><TextInput value={name} onChange={(event) => setName(event.target.value)} /></Field>
        <Field label="Size cap">
          <TextInput type="number" min={1} value={cap} onChange={(event) => setCap(Number(event.target.value))} />
          <span className="block text-gosi-midnight-80">{copy.waveCapHint}</span>
        </Field>
        <div>
          <h2 className="text-xl text-gosi-blue">2. Who qualifies</h2>
          <p className="mt-1 text-sm text-gosi-midnight-80">{copy.waveSteps[1]}</p>
        </div>
        <Field label="Region">
          <select className={selectClass} value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">Any</option>
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Sector">
          <select className={selectClass} value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="">Any</option>
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Pension system">
          <select className={selectClass} value={pension} onChange={(event) => setPension(event.target.value as typeof pension)}>
            <option value="">Any</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="combined">Combined (both systems)</option>
          </select>
          <span className="block text-gosi-midnight-80">{copy.wavePensionHint}</span>
        </Field>
        <Field label="Minimum years of contribution">
          <TextInput type="number" min={0} value={minYears} onChange={(event) => setMinYears(Number(event.target.value))} />
          <span className="block text-gosi-midnight-80">{copy.waveYearsHint}</span>
        </Field>
        <div className="rounded-2xl bg-gosi-midnight-10 p-3 text-sm">
          <h2 className="text-base font-medium text-gosi-blue">3. Check before sending</h2>
          <p className="mt-1 text-gosi-midnight-80">{copy.waveSteps[2]}</p>
          {preview && (
            <ul className="mt-3 space-y-1">
              {preview.steps.map((step) => (
                <li key={step.kind} className={step.count === 0 ? "font-medium" : undefined}>
                  {stepLabel(step)} · {step.count}
                </li>
              ))}
            </ul>
          )}
          {preview && preview.count > 0 && (
            <p className="mt-3">{preview.count} match. {preview.willInvite} will be invited.</p>
          )}
          {preview && preview.count === 0 && (
            <p className="mt-3">
              {emptyReason(preview)}
              {preview.alternatives.length > 0 && ` Still available: ${preview.alternatives.map((item) => `${pensionLabel[item.label] ?? item.label} ${item.count}`).join(", ")}.`}
            </p>
          )}
          {preview && preview.people.length > 0 && (
            <ul className="mt-3 space-y-1">
              {preview.people.map((person) => (
                <li key={person.name}>{person.name} · {person.region} · {pensionLabel[person.pension] ?? person.pension} · {person.sector} · {person.years} years</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl text-gosi-blue">4. Send</h2>
          <p className="mt-1 text-sm text-gosi-midnight-80">{copy.waveSteps[3]}</p>
        </div>
        <Button size="md" disabled={pending || !preview || preview.willInvite === 0} type="submit">Confirm and send</Button>
      </form>
      <form
        className="space-y-4 self-start rounded-2xl bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            const result = await inviteOneAction(operatorId, nationalId);
            setMessage(result.ok ? "Invitation sent." : result.error);
            if (result.ok) {
              setMatch(null);
              setNationalId("");
              router.refresh();
            }
          });
        }}
      >
        <h2 className="text-xl text-gosi-blue">Invite one person</h2>
        <p className="text-sm text-gosi-midnight-80">{copy.waveManualIntro}</p>
        <TextInput value={nationalId} onChange={(event) => { setNationalId(event.target.value); setMatch(null); }} placeholder="10 digits" inputMode="numeric" />
        <Button
          size="md"
          variant="secondary"
          type="button"
          disabled={pending}
          onClick={() => start(async () => {
            const result = await lookupInviteAction(nationalId);
            if (!result.ok) {
              setMatch(null);
              setMessage(result.error);
              return;
            }
            setMessage(null);
            setMatch(`${result.name} · ${result.region ?? ""} · ${pensionLabel[result.pension ?? ""] ?? result.pension ?? ""} · ${result.sector}`);
          })}
        >
          Look up GOSI record
        </Button>
        {match && <p className="rounded-2xl bg-gosi-midnight-10 p-3 text-sm">{match}</p>}
        <Button size="md" disabled={pending || !match} type="submit">Invite</Button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}
