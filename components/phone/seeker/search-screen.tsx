"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptySearchIllustration } from "@/components/illustrations/spots";
import { RetireeCard } from "@/components/phone/retiree-card";
import { AppHeader } from "@/components/phone/ui/header";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";
import { countLabel } from "@/lib/format";

const KEY = "gosi-recent-searches";

type ServiceTile = { id: string; shortName: string; name: string; blurb: string; icon: string; retirees: number };
type RetireeHit = {
  personId: string;
  name: string;
  discipline: string;
  years: number;
  rating: number | null;
  sessions: number;
  price: string;
  next: string | null;
  description: string;
};

export function SearchScreen({
  personaId,
  services,
  retirees,
  appNow,
}: {
  personaId: string;
  services: ServiceTile[];
  retirees: RetireeHit[];
  appNow: string;
}) {
  const now = new Date(appNow);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    input.current?.focus();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) setRecent(saved.filter((item) => typeof item === "string").slice(0, 6));
    } catch {
      setRecent([]);
    }
  }, []);

  function remember(term: string) {
    const next = [term, ...recent.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  function forget(term: string) {
    const next = recent.filter((item) => item !== term);
    setRecent(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const query = q.trim().toLowerCase();
  const serviceHits = query
    ? services.filter((item) => `${item.shortName} ${item.name} ${item.blurb}`.toLowerCase().includes(query))
    : [];
  const retireeHits = query
    ? retirees.filter((item) => `${item.name} ${item.discipline} ${item.description}`.toLowerCase().includes(query))
    : [];

  return (
    <div className="pb-8 text-gosi-rich-blue">
      <AppHeader title="Search" />
      <div className="px-5">
        <label className="flex h-12 items-center gap-2 rounded-[14px] bg-white px-3">
          <Search size={18} strokeWidth={1.75} className="text-gosi-midnight-50" />
          <input
            ref={input}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={copy.seekerUi.searchPlaceholder}
            className="h-full w-full bg-transparent text-[15px] outline-none"
          />
        </label>
        {!query && (
          <div className="mt-5 space-y-6">
            {recent.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">{copy.seekerUi.recent}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <span key={term} className="inline-flex h-10 items-center gap-1 rounded-full bg-white pl-3 pr-1 text-[13px] font-semibold">
                      <button type="button" onClick={() => setQ(term)}>{term}</button>
                      <button type="button" aria-label={`Remove ${term}`} className="grid h-8 w-8 place-items-center text-gosi-midnight-50" onClick={() => forget(term)}>
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-lg font-semibold">{copy.seekerUi.popular}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {services.map((item) => (
                  <Link key={item.id} href={`/phone/${personaId}/opportunities/t/${item.id}`} onClick={() => remember(item.shortName)} className="rounded-2xl bg-white p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gosi-green-10">
                      <BrandIcon name={item.icon} className="h-6 w-6" />
                    </span>
                    <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-[22px]">{item.shortName}</p>
                    <p className="mt-1 text-[13px] text-gosi-midnight-50">{countLabel(item.retirees, "retiree")}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
        {query && !serviceHits.length && !retireeHits.length && (
          <div className="mt-8 rounded-[20px] bg-white px-4 py-8 text-center">
            <EmptySearchIllustration className="mx-auto h-24 w-32" />
            <p className="mt-3 font-semibold">{copy.seekerUi.noRetirees}</p>
          </div>
        )}
        {query && (serviceHits.length > 0 || retireeHits.length > 0) && (
          <div className="mt-5 space-y-6">
            {serviceHits.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">{copy.seekerUi.servicesGroup}</h2>
                {serviceHits.map((item) => (
                  <Link key={item.id} href={`/phone/${personaId}/opportunities/t/${item.id}`} onClick={() => remember(q.trim())} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gosi-green-10">
                      <BrandIcon name={item.icon} className="h-6 w-6" />
                    </span>
                    <span className="min-w-0">
                      <p className="truncate font-semibold">{item.shortName}</p>
                      <p className="truncate text-[13px] text-gosi-midnight-50">{item.blurb}</p>
                    </span>
                  </Link>
                ))}
              </section>
            )}
            {retireeHits.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">{copy.seekerUi.retireesGroup}</h2>
                {retireeHits.map((item) => (
                  <span key={item.personId} onClick={() => remember(q.trim())}>
                    <RetireeCard variant="row" href={`/phone/${personaId}/opportunities/p/${item.personId}`} name={item.name} discipline={item.discipline} years={item.years} rating={item.rating} sessions={item.sessions} price={item.price} next={item.next} description={item.description} appNow={now} />
                  </span>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
