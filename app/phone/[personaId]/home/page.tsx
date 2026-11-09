import Link from "next/link";
import { Bell, Mic } from "lucide-react";
import { DemoButton } from "@/components/shared/demo-toast";
import { AmountCard } from "@/components/phone/amount-card";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";
import { getProfile } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { getAppNow } from "@/lib/domain/clock";
import { getInvitation } from "@/lib/domain/invitations";
import { unreadCount } from "@/lib/domain/notifications";
import { requireUser } from "@/lib/domain/personas";
import { checklistDone } from "@/lib/domain/rules";
import { ageInRiyadh, formatWhen, greeting } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

const services = [
  { label: "Wage Certificate", icon: "certified-document" },
  { label: "Pension Calculator", icon: "financial-investment" },
  { label: "Manage Contribution", icon: "commitment" },
];

export default async function HomePage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const appNow = await getAppNow();
  const [invitation, profile, unread, windows] = await Promise.all([
    user.person.is_retiree ? getInvitation(user.person.id) : Promise.resolve(null),
    user.person.is_retiree ? getProfile(user.person.id) : Promise.resolve(null),
    unreadCount(personaId),
    user.person.is_retiree ? listWindows(user.person.id) : Promise.resolve([]),
  ]);
  const { data: next } = profile?.state === "active"
    ? await admin().from("bookings").select("starts_at").eq("retiree_id", user.person.id).eq("status", "confirmed").gt("starts_at", appNow.toISOString()).order("starts_at").limit(1).maybeSingle()
    : { data: null };
  const ready = profile ? [profile.onboarding_watched_at, profile.readiness_passed_at, windows.length > 0].filter(Boolean).length : 0;
  const live = profile ? checklistDone(profile, windows.length) : false;
  const retireeCard = user.person.is_retiree && invitation ? retireeCopy(profile?.state ?? "invited", profile?.application_step ?? 1, next?.starts_at ?? null, ready, live) : null;
  const seekerHref = ageInRiyadh(user.person.birth_date, appNow) < 18 ? `/phone/${personaId}/opportunities` : `/phone/${personaId}/opportunities`;

  return (
    <div className="space-y-6 px-5 pb-6">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gosi-midnight text-[15px] font-semibold text-white">{user.person.first_name[0]}</span>
          <div>
            <p className="text-[13px] text-gosi-midnight-50">{greeting(appNow)},</p>
            <p className="text-lg font-semibold uppercase text-gosi-rich-blue">{user.person.first_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/phone/${personaId}/notifications`} aria-label="Notifications" className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-gosi-rich-blue">
            <Bell size={20} strokeWidth={1.75} />
            {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gosi-vivid-green" />}
          </Link>
          <DemoButton className="grid h-12 w-12 place-items-center rounded-full bg-white" aria-label="Search"><BrandIcon name="search" className="h-6 w-6" /></DemoButton>
          <DemoButton className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg" aria-label="Language">ع</DemoButton>
          <DemoButton className="grid h-12 w-12 place-items-center rounded-full bg-white" aria-label="Voice"><Mic size={18} strokeWidth={1.75} /></DemoButton>
        </div>
      </header>
      <div>
        <DemoButton className="flex w-full items-center gap-3 rounded-[20px] border border-gosi-purple bg-[#F4EEFF] p-4 text-left text-gosi-rich-blue">
          <BrandIcon name="values-culture" className="h-10 w-10 shrink-0" />
          <span className="text-[15px]">Congratulations on your work anniversary. Your dedication shines.</span>
        </DemoButton>
        <div className="mt-2 flex justify-center gap-1" aria-hidden>
          <span className="h-1.5 w-4 rounded-full bg-gosi-vivid-green" />
          <span className="h-1.5 w-1.5 rounded-full bg-gosi-midnight-25" />
          <span className="h-1.5 w-1.5 rounded-full bg-gosi-midnight-25" />
        </div>
      </div>
      <div className="grid grid-cols-[112px_1fr] gap-3">
        <DemoButton className="relative h-36 overflow-hidden rounded-[20px] bg-gosi-rich-blue text-white">
          <img src="/brand/patterns/pattern-2c-green-blue.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <span className="relative text-[13px] font-semibold">Through the years</span>
        </DemoButton>
        <AmountCard retiree={user.person.is_retiree} />
      </div>
      <DemoButton className="flex h-12 w-full items-center gap-2 rounded-full border bg-white px-4 text-left text-[15px] text-gosi-rich-blue">
        <img src="/brand/arrow/gosi-arrow-green.svg" alt="" className="h-4 w-4" />
        Find Anything with Just Your Voice!
      </DemoButton>
      <section>
        <h2 className="text-[22px] font-semibold text-gosi-rich-blue">GOSI Services</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {services.map((service) => (
            <DemoButton key={service.label} className="flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-[20px] bg-white p-3 text-center text-[13px] text-gosi-rich-blue">
              <BrandIcon name={service.icon} className="h-8 w-8" />
              {service.label}
            </DemoButton>
          ))}
        </div>
      </section>
      {retireeCard && (
        <section>
          <h2 className="text-[22px] font-semibold text-gosi-rich-blue">GOSI Opportunities</h2>
          <Link href={retireeCard.href(personaId)} className="relative mt-3 block overflow-hidden rounded-[20px] bg-gosi-rich-blue p-4 text-white">
            <img src="/brand/arrow/gosi-arrow.svg" alt="" className="absolute -right-6 top-4 h-28 opacity-30" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">GOSI Opportunities</p>
            <p className="mt-2 text-lg font-semibold">{retireeCard.title}</p>
            <p className="text-[15px] text-white/80">{retireeCard.body}</p>
            <span className="mt-4 inline-flex h-11 items-center rounded-full bg-gosi-vivid-green px-4 text-[15px] font-semibold text-gosi-rich-blue">{retireeCard.cta}</span>
          </Link>
        </section>
      )}
      {!user.person.is_retiree && (
        <section>
          <h2 className="text-[22px] font-semibold text-gosi-rich-blue">GOSI Opportunities</h2>
          <Link href={seekerHref} className="relative mt-3 block overflow-hidden rounded-[20px] bg-gosi-rich-blue p-4 text-white">
            <img src="/brand/arrow/gosi-arrow.svg" alt="" className="absolute -right-6 top-4 h-28 opacity-30" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">GOSI Opportunities</p>
            <p className="mt-2 text-lg font-semibold">{copy.seekerTitle}</p>
            <p className="text-[15px] text-white/80">{copy.seekerSubtitle}</p>
            <span className="mt-4 inline-flex h-11 items-center rounded-full bg-gosi-vivid-green px-4 text-[15px] font-semibold text-gosi-rich-blue">Explore</span>
          </Link>
        </section>
      )}
      <section className="rounded-[20px] bg-white p-4 text-gosi-rich-blue">
        <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="h-5" />
        <p className="mt-2 text-[13px] text-gosi-midnight-50">Financial literacy · Current path</p>
        <p className="text-lg font-semibold">Saving</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gosi-midnight-10"><div className="h-full w-full bg-gosi-vivid-green" /></div>
        <p className="mt-1 text-right text-[13px]">100%</p>
      </section>
      {!user.person.is_retiree && (
        <section>
          <h2 className="text-[22px] font-semibold text-gosi-rich-blue">You Might Be Interested</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto [scrollbar-width:none]">
            <Link href={seekerHref} className="relative min-w-[280px] overflow-hidden rounded-[20px] bg-gosi-rich-blue p-4 text-white">
              <BrandIcon name="individuals" tone="white" className="h-10 w-10" />
              <p className="mt-3 text-lg font-semibold">{copy.seekerTitle}</p>
              <p className="text-[15px] text-white/80">{copy.seekerSubtitle}</p>
              <span className="mt-4 inline-flex h-11 items-center rounded-full bg-gosi-vivid-green px-4 text-[15px] font-semibold text-gosi-rich-blue">Start now</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function retireeCopy(state: string, step: number, next: string | null, ready: number, live: boolean) {
  const home = (id: string) => `/phone/${id}/opportunities/retiree`;
  if (state === "invited" || !state) return { title: "Your experience still matters", body: "You're invited to share it with people who need it", cta: "Learn more", href: (id: string) => `/phone/${id}/opportunities/retiree/about` };
  if (state === "draft") return { title: "Continue your application", body: `Step ${step} of 5`, cta: "Continue", href: (id: string) => `/phone/${id}/opportunities/retiree/apply` };
  if (state === "pending_review") return { title: "Your application is under review", body: "We'll notify you here", cta: "View status", href: (id: string) => `/phone/${id}/opportunities/retiree/status` };
  if (state === "not_approved") return { title: "Action needed on your application", body: "Review the reason and resubmit", cta: "Review and resubmit", href: (id: string) => `/phone/${id}/opportunities/retiree/status` };
  if (state === "paused") return { title: "Your profile is paused", body: "Contact GOSI for details", cta: "View details", href: home };
  if (state === "active" && !live) return { title: `Almost live: ${ready} of 3 steps done`, body: "Finish the guide, test call, and availability", cta: "Finish setup", href: (id: string) => `/phone/${id}/opportunities/retiree/checklist` };
  return { title: next ? `Next session: ${formatWhen(next)}` : "No upcoming sessions", body: "Your sessions with seekers", cta: "Open", href: home };
}
