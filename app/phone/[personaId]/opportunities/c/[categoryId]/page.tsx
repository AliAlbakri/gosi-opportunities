import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/phone/ui/header";
import { BrandIcon } from "@/components/phone/brand-icon";
import { RetireeCard } from "@/components/phone/retiree-card";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { getAppNow } from "@/lib/domain/clock";
import { requireUser } from "@/lib/domain/personas";
import { coverFor, serviceIcons } from "@/lib/phone-icons";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ personaId: string; categoryId: string }>; searchParams: Promise<{ list?: string }> }) {
  const { personaId, categoryId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const { categories, serviceTypes } = await catalog();
  const category = categories.find((row) => row.id === categoryId);
  if (!category) notFound();
  const appNow = await getAppNow();
  const types = serviceTypes.filter((type) => type.category_id === categoryId);
  const counted = await Promise.all(types.map(async (type) => {
    const { cards } = await listRetireeCards({ serviceTypeId: type.id });
    const prices = cards.map((card) => card.priceLabel);
    const paid = prices.find((price) => price.startsWith("SAR"));
    return { type, count: cards.length, price: paid ? `from ${paid}` : "Free" };
  }));
  const { cards } = await listRetireeCards({ categoryId });
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <div className="bg-gosi-rich-blue text-white">
        <AppHeader transparent />
        <img src={coverFor(categoryId)} alt="" className="h-24 w-full object-cover" />
        <div className="px-5 pb-6">
          <h1 className="text-[22px] font-semibold">{category.name}</h1>
          <p className="text-[13px] text-white/80" dir="rtl">{category.name_ar}</p>
          <p className="mt-2 text-[15px] text-white/80">{category.blurb}</p>
        </div>
      </div>
      <div className="space-y-6 px-5 py-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Services in this category</h2>
          <div className="divide-y divide-gosi-midnight-10 overflow-hidden rounded-[20px] bg-white">
            {counted.map(({ type, count, price }) => (
              <Link key={type.id} href={`/phone/${personaId}/opportunities/t/${type.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gosi-green-10"><BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <p className="font-semibold">{type.name}</p>
                  <p className="text-[13px] text-gosi-midnight-50">{count} retirees · {price}</p>
                </span>
                <span aria-hidden>›</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Retirees in this category</h2>
          {(query.list === "all" ? cards : cards.slice(0, 3)).map((card) => <RetireeCard key={card.personId} href={`/phone/${personaId}/opportunities/p/${card.personId}`} name={card.name} discipline={card.discipline} languages={card.languages} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
          {query.list !== "all" && cards.length > 3 && <Link href={`/phone/${personaId}/opportunities/c/${categoryId}?list=all`} className="block text-center text-[15px] font-semibold text-gosi-blue">See all {cards.length} retirees</Link>}
        </section>
      </div>
    </div>
  );
}
