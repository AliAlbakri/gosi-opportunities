import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/phone/ui/header";
import { BrandIcon } from "@/components/phone/brand-icon";
import { Card } from "@/components/phone/ui/bits";
import { StickyFooter } from "@/components/phone/ui/buttons";
import { FaqList, Timeline } from "@/components/phone/ui/flow";
import { getInvitation } from "@/lib/domain/invitations";
import { requireUser } from "@/lib/domain/personas";
import { catalog } from "@/lib/domain/discovery";
import { coverFor } from "@/lib/phone-icons";

const faqs = [
  { q: "What is GOSI Opportunities?", a: "A place in the GOSI app where invited retirees give one-hour video sessions." },
  { q: "Who can book my sessions?", a: "GOSI app users aged 18 and over." },
  { q: "How long does review take?", a: "GOSI reviews each service and notifies you in the app." },
  { q: "What do seekers see about me?", a: "Your GOSI record, if you choose to show it, and the background you write. GOSI reviews the background before it is published." },
  { q: "Can I stop or pause?", a: "You can pause new bookings at any time. Confirmed sessions stay." },
  { q: "Are sessions recorded?", a: "No." },
];

export default async function AboutPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user?.person.is_retiree) notFound();
  const invitation = await getInvitation(user.person.id);
  if (!invitation) notFound();
  const { categories, serviceTypes } = await catalog();
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
          <h2 className="mb-3 text-lg font-semibold">What you’ll need</h2>
          <Card><ul className="list-disc space-y-1 pl-4 text-[15px]"><li>Your GOSI record, which is already here</li><li>A short description of each service</li><li>Certificates or a CV, if you have them</li><li>A phone with a camera and internet</li></ul></Card>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Good to know</h2>
          <Card><ul className="space-y-2 text-[15px]"><li>Sessions are one hour.</li><li>You can pause new bookings at any time.</li><li>Either side can cancel up to 3 hours before the start.</li><li>Terms are shown before you submit.</li></ul></Card>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">FAQ</h2>
          <FaqList items={faqs} />
        </section>
      </div>
      <StickyFooter>
        <Link href={`/phone/${personaId}/opportunities/retiree/apply`} className="flex h-[52px] items-center justify-center rounded-full bg-gosi-vivid-green text-[15px] font-semibold text-gosi-rich-blue">Start my application</Link>
        <Link href={`/phone/${personaId}/home`} className="mt-2 block text-center text-[15px] font-semibold text-gosi-blue">Not now</Link>
      </StickyFooter>
    </div>
  );
}
