import Link from "next/link";
import { notFound } from "next/navigation";
import { listRetireeCards, catalog } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { getAppNow } from "@/lib/domain/clock";
import { ageInRiyadh, formatWhen } from "@/lib/format";
import { copy } from "@/lib/copy";
import { initials } from "@/lib/utils";

export default async function BrowsePage({ params, searchParams }: { params: Promise<{ personaId: string }>; searchParams: Promise<{ q?: string; language?: string; price?: string; category?: string; type?: string }> }) {
  const { personaId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const appNow = await getAppNow();
  if (ageInRiyadh(user.person.birth_date, appNow) < 18) {
    return <div className="p-6 text-gosi-rich-blue"><h1 className="text-2xl font-medium">{copy.under18}</h1></div>;
  }
  const { categories, serviceTypes, paidEnabled } = await catalog();
  const { cards } = await listRetireeCards({
    q: query.q,
    language: query.language,
    price: query.price === "free" || query.price === "paid" ? query.price : "any",
    categoryId: query.category,
    serviceTypeId: query.type,
  });
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <form className="space-y-2">
        <input name="q" defaultValue={query.q} placeholder="Search" className="h-11 w-full rounded-2xl border px-3" />
        <div className="flex flex-wrap gap-2 text-sm">
          {["Arabic", "English", "French"].map((language) => (
            <Link key={language} className="rounded-full bg-white px-3 py-1" href={`?language=${language}`}>{language}</Link>
          ))}
          {paidEnabled && <Link className="rounded-full bg-white px-3 py-1" href="?price=free">Free only</Link>}
          {paidEnabled && <Link className="rounded-full bg-white px-3 py-1" href="?price=paid">Paid only</Link>}
        </div>
      </form>
      <div className="grid gap-2">
        {categories.map((category) => (
          <Link key={category.id} href={`?category=${category.id}`} className="rounded-3xl bg-white p-4">
            <p className="font-medium">{category.name}</p>
            <p className="text-sm" dir="rtl">{category.name_ar}</p>
          </Link>
        ))}
      </div>
      {query.category && (
        <div className="space-y-2">
          {serviceTypes.filter((type) => type.category_id === query.category).map((type) => (
            <Link key={type.id} href={`?type=${type.id}`} className="block rounded-2xl bg-gosi-green-10 p-3">{type.name}</Link>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {cards.map((card) => (
          <Link key={card.personId} href={`/phone/${personaId}/opportunities/p/${card.personId}`} className="block rounded-3xl bg-white p-4">
            <div className="flex gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gosi-midnight-10">{initials(card.name)}</span>
              <div>
                <p className="font-medium">{card.name}</p>
                <p className="text-sm">{card.discipline}</p>
                <p className="text-xs">{copy.verified}</p>
                <p className="text-sm">{card.languages.join(", ")}</p>
                <p className="text-sm">{card.rating ? `${card.rating.toFixed(1)} ★ · ${card.sessions} sessions` : copy.newProfile}</p>
                <p className="text-sm">{card.priceLabel}</p>
                <p className="text-sm">{card.next ? `Next: ${formatWhen(card.next)}` : copy.fullyBooked}</p>
              </div>
            </div>
          </Link>
        ))}
        {!cards.length && <p>No retirees match yet.</p>}
      </div>
      <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/bookings`}>My bookings</Link>
    </div>
  );
}
