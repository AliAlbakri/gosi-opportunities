"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoButton } from "@/components/shared/demo-toast";
import { maskNationalId } from "@/lib/utils";

type Persona = { id: string; display_name: string; blurb: string | null; national_id: string };

export function SplashFlow({ personas, remembered }: { personas: Persona[]; remembered: string | null }) {
  const [step, setStep] = useState<"a" | "b" | "welcome" | "login">("a");
  const router = useRouter();
  useEffect(() => {
    const a = setTimeout(() => setStep("b"), 800);
    const b = setTimeout(() => setStep("welcome"), 1600);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  if (step === "a" || step === "b") {
    return (
      <div className="grid h-dvh place-items-center bg-gosi-rich-blue">
        <img
          src={step === "a" ? "/brand/logo/gosi-wordmark-reversed.svg" : "/brand/logo/gosi-logo-primary-reversed.svg"}
          alt="gosi"
          className="w-40"
        />
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="min-h-dvh bg-white p-5 text-gosi-rich-blue">
        <h1 className="text-2xl font-medium">Choose an identity to continue (demo)</h1>
        <ul className="mt-4 space-y-2">
          {personas.map((persona) => (
            <li key={persona.id}>
              <button
                type="button"
                className="w-full rounded-3xl border border-gosi-midnight-25 p-4 text-left"
                onClick={() => router.push(`/phone/${persona.id}/home`)}
              >
                <p className="font-medium">{persona.display_name}</p>
                <p className="text-sm text-gosi-midnight-50">{maskNationalId(persona.national_id)}</p>
                <p className="text-sm">{persona.blurb}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const name = remembered?.toUpperCase();
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gosi-rich-blue px-5 py-6 text-white">
      <img src="/brand/arrow/gosi-arrow-rich-blue-80.svg" alt="" className="pointer-events-none absolute -left-10 top-24 w-80 opacity-80" />
      <div className="relative flex items-center justify-between">
        <img src="/brand/logo/gosi-wordmark-reversed.svg" alt="gosi" className="h-8" />
        <div className="flex gap-2">
          <DemoButton className="rounded-full bg-gosi-rich-blue-80 px-3 py-2 text-xs">Quick Services</DemoButton>
          <DemoButton className="grid h-10 w-10 place-items-center rounded-full bg-gosi-rich-blue-80">ع</DemoButton>
        </div>
      </div>
      <div className="relative mt-8 h-64 rounded-3xl border-4 border-gosi-vivid-green bg-gosi-rich-blue-80" />
      <h1 className="relative mt-8 text-3xl font-medium">{name ? "Welcome back" : "Welcome"}</h1>
      {name && <p className="relative text-4xl font-medium">{name}</p>}
      <button type="button" className="relative mt-6 h-[52px] w-full rounded-full bg-gosi-vivid-green font-medium text-gosi-rich-blue" onClick={() => setStep("login")}>
        Login
      </button>
      <DemoButton className="relative mt-3 h-[52px] w-full rounded-full border border-white font-medium">My Certificates</DemoButton>
      <p className="relative mt-6 text-center text-xs">
        By login to GOSI App, you agree on <span className="text-gosi-vivid-green">Privacy policy</span> and{" "}
        <span className="text-gosi-vivid-green">Taqdeer Program</span>
      </p>
    </div>
  );
}
