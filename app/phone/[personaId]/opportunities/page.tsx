import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountingIllustration, EducationIllustration, VerifiedIllustration } from "@/components/illustrations/spots";
import { HowItWorks } from "@/components/phone/seeker/how-it-works";
import { SeeAll } from "@/components/phone/seeker/retiree-rows";
import { RetireeCard } from "@/components/phone/retiree-card";
import { BrandIcon } from "@/components/phone/brand-icon";
import { AppHeader } from "@/components/phone/ui/header";
import { Avatar, DateBlock } from "@/components/phone/ui/bits";
import { InfoButton } from "@/components/phone/wizard-layout";
import { FaqList } from "@/components/phone/ui/flow";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { decorateBookings } from "@/lib/domain/hydrate";
import { requireUser } from "@/lib/domain/personas";
import { formatRemain, getSessionPhase } from "@/lib/domain/sessionPhase";
import { DAY_MS } from "@/lib/domain/rules";
import { ageInRiyadh, countLabel, formatClock, relativeTo, TZ } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";
import { serviceIcons } from "@/lib/phone-icons";
import { admin } from "@/lib/supabase/admin";
import type { Booking } from "@/lib/types";

export default async function BrowsePage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const appNow = await getAppNow();
  if (ageInRiyadh(user.person.birth_date, appNow) < 18) {
    return <div className="p-6"><AppHeader title="GOSI Opportunities" /><h1 className="mt-4 text-2xl font-semibold text-gosi-rich-blue">{copy.under18}</h1></div>;
  }
  const base = `/phone/${personaId}/opportunities`;
  const { categories, serviceTypes, paidEnabled } = await catalog();
  const { cards } = await listRetireeCards({});
  const windowStart = new Date(appNow.getTime() - 30 * 60 * 1000).toISOString();
  const { data: upcomingRows } = await admin().from("bookings").select("*").eq("seeker_id", user.person.id).in("status", ["confirmed", "pending_payment"]).gt("ends_at", windowStart).order("starts_at");
  const upcoming = await decorateBookings((upcomingRows ?? []) as Booking[]);
  const next = upcoming.find((row) => row.status === "pending_payment" || getSessionPhase({ status: row.status, startsAt: row.starts_at, endsAt: row.ends_at, seekerId: row.seeker_id, retireeId: row.retiree_id, youId: user.person.id }, [], appNow).join !== "none");
  const { count: bookingCount } = await admin().from("bookings").select("id", { count: "exact", head: true }).eq("seeker_id", user.person.id);
  const week = cards.filter((card) => card.next && card.next.getTime() <= appNow.getTime() + 7 * DAY_MS);
  const top = cards.filter((card) => (card.rating ?? 0) >= 4.5);
  const popular = serviceTypes
    .map((type) => ({ type, count: cards.filter((card) => card.services.some((service) => service.id === type.id)).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const nextPhase = next ? getSessionPhase({ status: next.status, startsAt: next.starts_at, endsAt: next.ends_at, seekerId: next.seeker_id, retireeId: next.retiree_id, youId: user.person.id }, [], appNow) : null;
  const live = nextPhase?.join === "now" || nextPhase?.join === "rejoin";
  const lockedLabel = nextPhase?.phase === "soon"
    ? `${copy.session.joinIn} ${formatRemain(nextPhase.opensAt.getTime() - appNow.getTime())}`
    : nextPhase ? `${copy.session.joinAt} ${formatInTimeZone(nextPhase.opensAt, TZ, "HH:mm")}` : copy.seekerUi.details;
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <div className="relative overflow-hidden bg-gosi-rich-blue text-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 opacity-10" style={{ backgroundImage: "url(/brand/arrow/gosi-arrow-white.svg)", backgroundSize: "72px", backgroundRepeat: "repeat" }} />
        <AppHeader transparent title="GOSI Opportunities" action={<Link href={`${base}/bookings`} aria-label="My bookings" className="relative"><BrandIcon name="calendar" tone="white" className="h-6 w-6" />{upcoming.length > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-gosi-vivid-green px-1 text-[11px] font-semibold text-gosi-rich-blue">{upcoming.length}</span>}</Link>} />
        <div className="px-5 pb-5">
          <h1 className="max-w-[240px] text-[22px] font-semibold leading-7">{copy.seekerUi.heroTitle}</h1>
          <p className="mt-1 max-w-[260px] text-[15px] leading-[22px] text-white/80">{copy.seekerUi.heroSubtitle}</p>
          <Link href={`${base}/search`} className="mt-4 flex h-12 items-center rounded-[14px] bg-white px-4 text-[15px] text-gosi-midnight-50">{copy.seekerUi.searchPlaceholder}</Link>
        </div>
      </div>
      <div className="space-y-8 px-5 py-6">
        {next && (
          <Link href={live ? `${base}/bookings/${next.id}/lobby` : `${base}/bookings/${next.id}`} className={`flex gap-3 rounded-[20px] p-3 ${live ? "bg-gosi-vivid-green" : "bg-white"}`}>
            <DateBlock date={next.starts_at} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <Avatar name={next.retireeName} size={32} verified />
                <span className="truncate text-[15px] font-semibold">{next.retireeName}</span>
              </span>
              <span className="mt-1 block truncate text-[13px] text-gosi-midnight-50">{next.serviceShort}</span>
              <span className="mt-1 block text-[13px] font-semibold">{formatClock(next.starts_at)} · {relativeTo(next.starts_at, appNow)}</span>
            </span>
            <span className={`inline-flex items-center gap-2 self-center text-[15px] font-semibold ${live ? "text-gosi-rich-blue" : "text-gosi-midnight-50"}`}>
              {live && <span className="relative inline-flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gosi-rich-blue opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-gosi-rich-blue" /></span>}
              {live ? (nextPhase?.join === "rejoin" ? copy.session.rejoin : copy.session.joinNow) : nextPhase?.join === "locked" ? lockedLabel : copy.seekerUi.details}
            </span>
          </Link>
        )}
        <HowItWorks show={!bookingCount} />
        <section>
          <h2 className="text-lg font-semibold">{copy.seekerUi.categories}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const tint = category.id === "accounting" ? "bg-[#E6F0FF]" : "bg-[#E6F9E6]";
              const Illustration = category.id === "accounting" ? AccountingIllustration : EducationIllustration;
              const services = serviceTypes.filter((type) => type.category_id === category.id).length;
              return (
                <Link key={category.id} href={`${base}/c/${category.id}`} className={`relative h-44 overflow-hidden rounded-[20px] p-3 ${tint}`}>
                  <Illustration className="absolute -right-2 -top-2 h-24 w-32" />
                  <span className="absolute bottom-3 left-3 right-3">
                    <span className="line-clamp-2 block text-[15px] font-semibold leading-[22px]">{category.name}</span>
                    <span className="mt-0.5 block text-[13px] text-gosi-midnight-50" dir="rtl">{category.name_ar}</span>
                    <span className="mt-2 inline-flex h-7 items-center rounded-full bg-white px-2.5 text-[12px] font-semibold">{countLabel(services, "service")}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{copy.seekerUi.popular}</h2>
            <SeeAll href={`${base}/search`} label={copy.seekerUi.seeAllServices} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popular.map(({ type, count }) => (
              <Link key={type.id} href={`${base}/t/${type.id}`} className="rounded-2xl bg-white p-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gosi-green-10"><BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-6 w-6" /></span>
                <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-[22px]">{type.short_name}</p>
                <p className="mt-1 text-[13px] text-gosi-midnight-50">{countLabel(count, "retiree")}</p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{copy.seekerUi.thisWeek}</h2>
            <SeeAll href={`${base}/results?sort=soonest`} label={copy.seekerUi.seeAll} />
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none]">
            {week.map((card) => <RetireeCard key={card.personId} href={`${base}/p/${card.personId}`} name={card.name} discipline={card.discipline} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
          </div>
        </section>
        {top.length >= 3 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{copy.seekerUi.topRated}</h2>
              <SeeAll href={`${base}/results?sort=rating`} label={copy.seekerUi.seeAll} />
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none]">
              {top.map((card) => <RetireeCard key={card.personId} href={`${base}/p/${card.personId}`} name={card.name} discipline={card.discipline} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
            </div>
          </section>
        )}
        <section className="flex items-center gap-3 rounded-[20px] bg-white p-3">
          <VerifiedIllustration className="h-16 w-20 shrink-0" />
          <p className="flex-1 text-[15px] leading-[22px]">{copy.seekerUi.trust}</p>
          <InfoButton title={copy.seekerUi.trust} body={copy.seekerUi.trustSheet} />
        </section>
        <section>
          <h2 className="text-lg font-semibold">Questions</h2>
          <div className="mt-3"><FaqList items={copy.faq.seeker} paid={paidEnabled} /></div>
        </section>
      </div>
    </div>
  );
}
