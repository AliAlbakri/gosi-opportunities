"use client";

import { useState, useTransition } from "react";
import { resetDataAction, testNotificationAction } from "@/app/actions/demo";
import { IphoneFrame } from "@/components/phone/iphone-frame";
import { copy } from "@/lib/copy";

type Option = { id: string; display_name: string; blurb: string | null };

export function Launcher({
  retirees,
  seekers,
  operators,
}: {
  retirees: Option[];
  seekers: Option[];
  operators: Option[];
}) {
  const [retiree, setRetiree] = useState(retirees.find((row) => row.id === "ret-fahad")?.id ?? retirees[0]?.id ?? "");
  const [seeker, setSeeker] = useState(seekers.find((row) => row.id === "seek-sara")?.id ?? seekers[0]?.id ?? "");
  const [operator, setOperator] = useState(operators[0]?.id ?? "op-noura");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr_280px]">
      <PhoneColumn title="Retiree phone" value={retiree} options={retirees} onChange={setRetiree} />
      <PhoneColumn title="Seeker phone" value={seeker} options={seekers} onChange={setSeeker} />
      <aside className="space-y-3 rounded-3xl bg-white p-4 text-sm text-gosi-rich-blue">
        <h2 className="text-lg font-medium">Shortcuts</h2>
        <label className="block">
          Operator
          <select className="mt-1 h-10 w-full rounded-xl border px-2" value={operator} onChange={(event) => setOperator(event.target.value)}>
            {operators.map((row) => (
              <option key={row.id} value={row.id}>{row.display_name}</option>
            ))}
          </select>
        </label>
        <a className="block text-gosi-blue" href={`/ops/${operator}`} target="_blank" rel="noreferrer">Open ops console</a>
        <a className="block text-gosi-blue" href="/tech" target="_blank" rel="noreferrer">Open tech config</a>
        <a className="block text-gosi-blue" href="/clock" target="_blank" rel="noreferrer">{copy.clockOpen}</a>
        <a className="block text-gosi-blue" href={`/phone/${retiree}/home`} target="_blank" rel="noreferrer">Open retiree phone</a>
        <a className="block text-gosi-blue" href={`/phone/${seeker}/home`} target="_blank" rel="noreferrer">Open seeker phone</a>
        <button
          type="button"
          className="w-full rounded-full bg-gosi-vivid-green px-3 py-2 text-gosi-rich-blue"
          disabled={pending || !seeker}
          onClick={() => start(async () => { await testNotificationAction(seeker); setMessage("Sent to the seeker phone."); })}
        >
          {copy.testNotify}
        </button>
        <button
          type="button"
          className="w-full rounded-full border px-3 py-2"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(copy.resetConfirm)) return;
            start(async () => {
              await resetDataAction();
              setMessage("Demo data reset.");
              window.location.reload();
            });
          }}
        >
          {copy.reset}
        </button>
        {message && <p>{message}</p>}
        <ol className="list-decimal space-y-2 pl-4 text-xs text-gosi-midnight-80">
          {copy.script.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function PhoneColumn({ title, value, options, onChange }: { title: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-medium text-gosi-rich-blue">{title}</h2>
        <select className="h-10 max-w-[220px] rounded-xl border bg-white px-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((row) => (
            <option key={row.id} value={row.id}>{row.display_name}</option>
          ))}
        </select>
      </div>
      <IphoneFrame>
        {value ? (
          <iframe title={title} src={`/phone/${value}/home`} className="block h-[844px] w-[390px] border-0 bg-white" allow="camera; microphone; display-capture; autoplay" />
        ) : (
          <div className="grid h-[844px] place-items-center bg-white text-sm">Reset demo data to load personas.</div>
        )}
      </IphoneFrame>
    </section>
  );
}
