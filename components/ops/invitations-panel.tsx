"use client";

import { useState, useTransition } from "react";
import { inviteOneAction, lookupInviteAction, previewWaveAction, sendWaveAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";

export function InvitationsPanel({ operatorId, regions, sectors }: { operatorId: string; regions: string[]; sectors: string[] }) {
  const [name, setName] = useState("Riyadh English teachers");
  const [cap, setCap] = useState(5);
  const [minYears, setMinYears] = useState(0);
  const [region, setRegion] = useState("Riyadh");
  const [sector, setSector] = useState("Education");
  const [pension, setPension] = useState<"private" | "public" | "combined" | "">("private");
  const [preview, setPreview] = useState<string>("");
  const [nationalId, setNationalId] = useState("");
  const [match, setMatch] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const filters = { pensionSystems: pension ? [pension] : [], sectors: sector ? [sector] : [], regions: region ? [region] : [], minYears };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="space-y-3 rounded-2xl bg-white p-4" onSubmit={(event) => { event.preventDefault(); start(async () => { const result = await sendWaveAction({ operatorId, name, sizeCap: cap, ...filters }); setMessage(result.ok ? `Sent ${result.sent}` : result.error); }); }}>
        <h2 className="text-xl text-gosi-blue">New wave</h2>
        <Field label="Wave name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Size cap"><TextInput type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} /></Field>
        <Field label="Minimum years"><TextInput type="number" value={minYears} onChange={(e) => setMinYears(Number(e.target.value))} /></Field>
        <Field label="Region"><select value={region} onChange={(e) => setRegion(e.target.value)}><option value="">Any</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Sector"><select value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Any</option>{sectors.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Pension system"><select value={pension} onChange={(e) => setPension(e.target.value as typeof pension)}><option value="">Any</option><option value="private">Private</option><option value="public">Public</option><option value="combined">Combined</option></select></Field>
        <button type="button" className="text-gosi-blue" onClick={() => start(async () => { const result = await previewWaveAction(filters); if (result.ok) setPreview(`${result.preview.count} people. ${Object.entries(result.preview.breakdown).map(([key, value]) => `${key}: ${value}`).join(", ")}`); })}>Count candidates</button>
        <p>{preview}</p>
        <Button size="md" disabled={pending} type="submit">Confirm and send</Button>
      </form>
      <form className="space-y-3 rounded-2xl bg-white p-4" onSubmit={(event) => { event.preventDefault(); start(async () => { const result = await inviteOneAction(operatorId, nationalId); setMessage(result.ok ? "Invitation sent." : result.error); if (result.ok) setMatch(null); }); }}>
        <h2 className="text-xl text-gosi-blue">Invite by National ID</h2>
        <TextInput value={nationalId} onChange={(e) => { setNationalId(e.target.value); setMatch(null); }} placeholder="10 digits" />
        <button type="button" className="text-gosi-blue" onClick={() => start(async () => { const result = await lookupInviteAction(nationalId); if (!result.ok) { setMatch(null); setMessage(result.error); return; } setMessage(null); setMatch(`${result.name} · ${result.region ?? ""} · ${result.pension ?? ""} · ${result.sector}`); })}>Look up GOSI record</button>
        {match && <p>{match}</p>}
        <Button size="md" disabled={pending || !match} type="submit">Invite</Button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
