import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/phone/ui/header";
import { BrandIcon } from "@/components/phone/brand-icon";
import { EmptyState } from "@/components/phone/ui/bits";
import { FaqList } from "@/components/phone/ui/flow";
import { RetireeCard } from "@/components/phone/retiree-card";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { ageInRiyadh, formatWhen } from "@/lib/format";
import { coverFor, serviceIcons } from "@/lib/phone-icons";
import { admin } from "@/lib/supabase/admin";

export default async function BrowsePage({ params, searchParams }: { params: Promise<{ personaId: string }>; searchParams: Promise<{ q?: string; language?: string }> }) {
  const { personaId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const appNow = await getAppNow();
  if (ageInRiyadh(user.person.birth_date, appNow) < 18) {
    return <div className="p-6"><AppHeader title="GOSI Opportunities" /><h1 className="mt-4 text-2xl font-semibold text-gosi-rich-blue">{copy.under18}</h1></div>;
  }
  const { categories, serviceTypes, paidEnabled } = await catalog();
  const { cards } = await listRetireeCards({ q: query.q, language: query.language });
  const { data: nextBooking } = await admin().from("bookings").select("id, starts_at, retiree_id").eq("seeker_id", user.person.id).eq("status", "confirmed").gt("starts_at", appNow.toISOString()).order("starts_at").limit(1).maybeSingle();
  const counted = await Promise.all(categories.map(async (category) => {
    const { cards: rows } = await listRetireeCards({ categoryId: category.id });
    return [category.id, rows.length] as const;
  }));
  const counts = new Map(counted);
  const topRated = [...cards].filter((card) => card.rating != null).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const fresh = cards.filter((card) => card.rating == null).slice(0, 4);
  if (query.q || query.language) {
    return (
      <div className="space-y-3 p-5 text-gosi-rich-blue">
        <AppHeader title="Search" />
        <p className="text-[13px] text-gosi-midnight-50">{cards.length} retirees</p>
        {cards.map((card) => <RetireeCard key={card.personId} href={`/phone/${personaId}/opportunities/p/${card.personId}`} name={card.name} discipline={card.discipline} languages={card.languages} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
        {!cards.length && <EmptyState title="No retirees match" text="Try another name, language, or service." />}
      </div>
    );
  }
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <div className="bg-gosi-rich-blue px-5 pb-6 text-white">
        <AppHeader transparent title="GOSI Opportunities" action={<Link href={`/phone/${personaId}/opportunities/bookings`} aria-label="My bookings"><BrandIcon name="calendar" tone="white" className="h-6 w-6" /></Link>} />
        <h1 className="text-[28px] font-bold leading-9">Learn from experienced retirees</h1>
        <p className="mt-2 text-[15px] text-white/80">One-hour video sessions with people verified through GOSI records.</p>
        <form className="mt-4" action={`/phone/${personaId}/opportunities`}>
          <input name="q" placeholder="Search services or names" className="h-12 w-full rounded-[14px] px-4 text-[15px] text-gosi-rich-blue" />
        </form>
      </div>
      <div className="space-y-8 px-5 py-6">
        {nextBooking && (
          <Link href={`/phone/${personaId}/opportunities/bookings/${nextBooking.id}`} className="block rounded-[20px] bg-white p-4">
            <p className="text-[13px] text-gosi-midnight-50">Your next session</p>
            <p className="font-semibold">{formatWhen(nextBooking.starts_at)}</p>
          </Link>
        )}
        <section>
          <h2 className="text-lg font-semibold">How it works</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-[20px] bg-white p-3 text-center text-[13px]">
            {[["individuals", "Choose a retiree"], ["calendar", "Book an hour"], ["phone", "Meet by video"]].map(([icon, label]) => (
              <div key={label}><BrandIcon name={icon} className="mx-auto h-8 w-8" /><p className="mt-2">{label}</p></div>
            ))}
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Browse by category</h2>
          {categories.map((category) => {
            const types = serviceTypes.filter((type) => type.category_id === category.id);
            return (
              <Link key={category.id} href={`/phone/${personaId}/opportunities/c/${category.id}`} className="block overflow-hidden rounded-[20px] bg-gosi-rich-blue text-white">
                <img src={coverFor(category.id)} alt="" className="h-28 w-full object-cover" />
                <div className="p-4">
                  <p className="text-[22px] font-semibold">{category.name}</p>
                  <p className="text-[13px] text-white/80" dir="rtl">{category.name_ar}</p>
                  <p className="mt-3 text-[13px]">{types.length} services · {counts.get(category.id) ?? 0} retirees</p>
                </div>
              </Link>
            );
          })}
        </section>
        <section>
          <h2 className="text-lg font-semibold">Popular services</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {serviceTypes.map((type) => (
              <Link key={type.id} href={`/phone/${personaId}/opportunities/t/${type.id}`} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold">
                <BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-5 w-5" />
                {type.name}
              </Link>
            ))}
          </div>
        </section>
        {[
          { title: "Available this week", rows: cards.slice(0, 4) },
          { title: "Top rated", rows: topRated },
          { title: "New on GOSI Opportunities", rows: fresh },
        ].map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.rows.map((card) => <RetireeCard key={`${section.title}-${card.personId}`} href={`/phone/${personaId}/opportunities/p/${card.personId}`} name={card.name} discipline={card.discipline} languages={card.languages} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
            {!section.rows.length && <p className="text-[13px] text-gosi-midnight-50">None yet</p>}
          </section>
        ))}
        <p className="flex gap-2 text-[13px] text-gosi-midnight-50"><BrandIcon name="security" className="h-5 w-5" /> Every retiree is verified through GOSI records. Sessions are guidance based on professional experience, not a licensed professional service.</p>
        <section>
          <h2 className="text-lg font-semibold">Questions</h2>
          <div className="mt-3">
            <FaqList items={copy.faq.seeker} paid={paidEnabled} />
          </div>
        </section>
      </div>
    </div>
  );
}
