import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptySearchIllustration } from "@/components/illustrations/spots";
import { FilterBar } from "@/components/phone/seeker/filter-bar";
import { RetireeRows } from "@/components/phone/seeker/retiree-rows";
import { AppHeader } from "@/components/phone/ui/header";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { countLabel } from "@/lib/format";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ personaId: string }>;
  searchParams: Promise<{ category?: string; sort?: string; language?: string; rating?: string; week?: string; q?: string }>;
}) {
  const { personaId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const { categories } = await catalog();
  const category = categories.find((row) => row.id === query.category);
  const sort = query.sort === "rating" || query.sort === "sessions" ? query.sort : "soonest";
  const appNow = await getAppNow();
  const { cards, languages } = await listRetireeCards({
    categoryId: query.category,
    sort,
    language: query.language,
    minRating: query.rating === "4" ? 4 : undefined,
    thisWeek: query.week === "1",
    q: query.q,
  });
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <AppHeader title={category?.name ?? copy.seekerUi.retireesGroup} />
      <FilterBar countText={countLabel(cards.length, "retiree")} languages={languages} sort={sort} language={query.language} rating={query.rating === "4"} week={query.week === "1"} />
      <div className="px-5 pt-4">
        {cards.length ? <RetireeRows cards={cards} personaId={personaId} appNow={appNow} /> : (
          <div className="rounded-[20px] bg-white px-4 py-8 text-center">
            <EmptySearchIllustration className="mx-auto h-24 w-32" />
            <p className="mt-3 text-lg font-semibold">{copy.seekerUi.noRetirees}</p>
            <Link href={`/phone/${personaId}/opportunities`} className="mt-3 inline-flex text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.browseOther}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
