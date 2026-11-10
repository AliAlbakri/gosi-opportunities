import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AccountingIllustration, EducationIllustration } from "@/components/illustrations/spots";
import { Blurb } from "@/components/phone/seeker/blurb";
import { SeeAll } from "@/components/phone/seeker/retiree-rows";
import { RetireeCard } from "@/components/phone/retiree-card";
import { BrandIcon } from "@/components/phone/brand-icon";
import { AppHeader } from "@/components/phone/ui/header";
import { AvatarStack, StatusPill } from "@/components/phone/ui/bits";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { countLabel } from "@/lib/format";
import { serviceIcons } from "@/lib/phone-icons";
import { copy } from "@/lib/copy";

export default async function CategoryPage({ params }: { params: Promise<{ personaId: string; categoryId: string }> }) {
  const { personaId, categoryId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const { categories, serviceTypes, paidEnabled } = await catalog();
  const category = categories.find((row) => row.id === categoryId);
  if (!category) notFound();
  const appNow = await getAppNow();
  const { cards } = await listRetireeCards({ categoryId });
  const base = `/phone/${personaId}/opportunities`;
  const tint = categoryId === "accounting" ? "bg-[#E6F0FF]" : "bg-[#E6F9E6]";
  const Illustration = categoryId === "accounting" ? AccountingIllustration : EducationIllustration;
  const services = serviceTypes
    .filter((type) => type.category_id === categoryId)
    .map((type) => ({ type, people: cards.filter((card) => card.services.some((service) => service.id === type.id)) }))
    .sort((a, b) => Number(a.people.length === 0) - Number(b.people.length === 0) || a.type.sort - b.type.sort);
  const prices = cards.flatMap((card) => card.services.filter((service) => service.categoryId === categoryId && service.priceLabel.startsWith("SAR")).map((service) => Number(service.priceLabel.replace("SAR ", ""))));
  const from = paidEnabled && prices.length ? Math.min(...prices) : null;
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <div className={tint}>
        <AppHeader transparent hero="light" titleOnScroll title={category.name} />
        <div className="relative px-5 pb-5">
          <Illustration className="ml-auto h-[120px] w-40" />
          <h1 className="text-[22px] font-semibold leading-7">{category.name}</h1>
          <p className="text-[13px] text-gosi-midnight-50" dir="rtl">{category.name_ar}</p>
          <Blurb text={category.blurb} />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[13px] font-semibold">{countLabel(services.length, "service")}</span>
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[13px] font-semibold">{countLabel(cards.length, "retiree")}</span>
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[13px] font-semibold">{from ? `From SAR ${from}` : copy.seekerUi.freeSessions}</span>
          </div>
        </div>
      </div>
      <div className="space-y-8 px-5 py-6">
        <div className="divide-y divide-gosi-midnight-10 overflow-hidden rounded-[20px] bg-white">
          {services.map(({ type, people }) => {
            const open = people.length > 0;
            const body = (
              <>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${categoryId === "accounting" ? "bg-[#E6F0FF]" : "bg-[#E6F9E6]"}`}>
                  <BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{type.short_name}</span>
                  <span className="block truncate text-[13px] text-gosi-midnight-50">{type.blurb}</span>
                  <span className="mt-1 flex items-center gap-2">
                    {open ? <AvatarStack names={people.slice(0, 3).map((card) => card.name)} /> : <StatusPill>{copy.seekerUi.comingSoon}</StatusPill>}
                    {open && <span className="text-[13px] text-gosi-midnight-50">{countLabel(people.length, "retiree")}</span>}
                  </span>
                </span>
                {open && <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-gosi-midnight-50" />}
              </>
            );
            const className = `flex items-center gap-3 px-4 py-3 ${open ? "" : "pointer-events-none opacity-50"}`;
            return open ? <Link key={type.id} href={`${base}/t/${type.id}`} className={className}>{body}</Link> : <div key={type.id} className={className}>{body}</div>;
          })}
        </div>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{copy.seekerUi.retireesIn} {category.name}</h2>
            <SeeAll href={`${base}/results?category=${categoryId}&sort=soonest`} label={`${copy.seekerUi.seeAll} ${cards.length}`} />
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none]">
            {cards.map((card) => <RetireeCard key={card.personId} href={`${base}/p/${card.personId}`} name={card.name} discipline={card.discipline} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
