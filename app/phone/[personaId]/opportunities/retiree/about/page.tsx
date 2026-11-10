import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/phone/ui/header";
import { BrandIcon } from "@/components/phone/brand-icon";
import { Card } from "@/components/phone/ui/bits";
import { StickyFooter } from "@/components/phone/ui/buttons";
import { FaqList, Timeline } from "@/components/phone/ui/flow";
import { copy } from "@/lib/copy";
import { getInvitation } from "@/lib/domain/invitations";
import { requireUser } from "@/lib/domain/personas";
import { catalog } from "@/lib/domain/discovery";
import { coverFor } from "@/lib/phone-icons";

export default async function AboutPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user?.person.is_retiree) notFound();
  const invitation = await getInvitation(user.person.id);
  if (!invitation) notFound();
  const { categories, serviceTypes, paidEnabled } = await catalog();
  return (
    <div className="pb-28 text-gosi-rich-blue">
      <div className="bg-gosi-rich-blue px-5 pb-8 text-white">
        <AppHeader transparent />
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold">You’re invited</span>
        <h1 className="mt-4 text-[28px] font-bold leading-9">Your experience still matters</h1>
        <p className="mt-2 text-[15px] leading-6 text-white/80">GOSI Opportunities lets you share what you’ve learned in your career through one-hour video sessions in the GOSI app.</p>
      </div>
      <div className="space-y-8 px-5 py-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Why join</h2>
          <div className="grid gap-3">
            {[
              ["partnership", "Share what you know", "One hour on a subject you have lived."],
              ["calendar", "Choose your own times", "Set the hours you want to be booked."],
              ["security", "Verified by GOSI", "Seekers see your GOSI-verified experience."],
            ].map(([icon, title, body]) => (
              <Card key={title} className="flex gap-3">
                <BrandIcon name={icon} className="h-8 w-8" />
                <span><p className="font-semibold">{title}</p><p className="text-[13px] text-gosi-midnight-50">{body}</p></span>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Who it’s for in this phase</h2>
          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="overflow-hidden rounded-[20px] bg-gosi-rich-blue text-white">
                <img src={coverFor(category.id)} alt="" className="h-24 w-full object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{category.name}</p>
                  <ul className="mt-2 space-y-1 text-[13px] text-white/80">
                    {serviceTypes.filter((type) => type.category_id === category.id).map((type) => <li key={type.id}>{type.name}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">How it works</h2>
          <Card><Timeline items={[
            { title: "Apply", caption: "About 10 minutes. Your GOSI record fills in.", state: "current" },
            { title: "GOSI reviews each service", caption: "We'll notify you in the app.", state: "upcoming" },
            { title: "Get ready", caption: "A short video and a test call.", state: "upcoming" },
            { title: "Set your availability", state: "upcoming" },
            { title: "Start sessions", caption: "One hour, by video, in the GOSI app.", state: "upcoming" },
          ]} /></Card>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.landing.needTitle}</h2>
          <Card className="divide-y divide-gosi-midnight-10 px-4 py-1">
            {copy.landing.needs.map((item) => (
              <div key={item.text} className="flex items-center gap-3 py-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${item.tone === "optional" ? "border border-gosi-midnight-25" : "bg-gosi-green-10"}`}>
                  {item.tone === "optional" ? <span className="h-0.5 w-2.5 rounded-full bg-gosi-midnight-50" /> : <Check size={15} strokeWidth={2.5} />}
                </span>
                <p className="min-w-0 flex-1 text-[15px] leading-[22px]">{item.text}</p>
                {item.tone !== "need" && (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tone === "ready" ? "bg-gosi-green-10" : "bg-gosi-midnight-10 text-gosi-midnight-80"}`}>
                    {item.tone === "ready" ? copy.landing.ready : copy.landing.optional}
                  </span>
                )}
              </div>
            ))}
          </Card>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.landing.knowTitle}</h2>
          <Card className="divide-y divide-gosi-midnight-10 px-4 py-1">
            {[{ icon: paidEnabled ? "financial-investment" : "benefits", label: copy.landing.price, value: paidEnabled ? copy.landing.priceOn : copy.landing.priceOff }, ...copy.landing.facts].map((fact) => (
              <div key={fact.label} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-gosi-green-10">
                  <BrandIcon name={fact.icon} className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <p className="text-[13px] leading-[18px] text-gosi-midnight-50">{fact.label}</p>
                  <p className="text-[15px] font-semibold leading-[22px]">{fact.value}</p>
                </span>
              </div>
            ))}
          </Card>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">FAQ</h2>
          <FaqList items={copy.faq.retiree} paid={paidEnabled} />
        </section>
      </div>
      <StickyFooter>
        <Link href={`/phone/${personaId}/opportunities/retiree/apply`} className="flex h-[52px] items-center justify-center rounded-full bg-gosi-vivid-green text-[15px] font-semibold text-gosi-rich-blue">Start my application</Link>
        <Link href={`/phone/${personaId}/home`} className="mt-2 block text-center text-[15px] font-semibold text-gosi-blue">Not now</Link>
      </StickyFooter>
    </div>
  );
}
