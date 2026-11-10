import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptySearchIllustration } from "@/components/illustrations/spots";
import { FilterBar } from "@/components/phone/seeker/filter-bar";
import { RetireeRows } from "@/components/phone/seeker/retiree-rows";
import { BrandIcon } from "@/components/phone/brand-icon";
import { AppHeader } from "@/components/phone/ui/header";
import { InfoButton } from "@/components/phone/wizard-layout";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { countLabel } from "@/lib/format";
import { serviceIcons } from "@/lib/phone-icons";

export default async function ServiceTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ personaId: string; serviceTypeId: string }>;
  searchParams: Promise<{ sort?: string; language?: string; rating?: string; week?: string }>;
}) {
  const { personaId, serviceTypeId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const { serviceTypes } = await catalog();
  const type = serviceTypes.find((row) => row.id === serviceTypeId);
  if (!type) notFound();
  const sort = query.sort === "rating" || query.sort === "sessions" ? query.sort : "soonest";
  const appNow = await getAppNow();
  const { cards, languages } = await listRetireeCards({
    serviceTypeId,
    sort,
    language: query.language,
    minRating: query.rating === "4" ? 4 : undefined,
    thisWeek: query.week === "1",
  });
  const base = `/phone/${personaId}/opportunities`;
  return (
    <div className="pb-8 text-gosi-rich-blue">
      <AppHeader titleOnScroll title={type.name} />
      <div className="px-5 pb-4">
        <div className="flex gap-3">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${type.category_id === "accounting" ? "bg-[#E6F0FF]" : "bg-[#E6F9E6]"}`}>
            <BrandIcon name={serviceIcons[type.id] ?? "development"} className="h-7 w-7" />
          </span>
          <h1 className="text-[22px] font-semibold leading-7">{type.name}</h1>
        </div>
        <p className="mt-2 text-[15px] leading-[22px] text-gosi-midnight-50">{type.blurb}</p>
        {type.category_id === "accounting" && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-gosi-midnight-10 px-3 py-2">
            <span className="text-[15px] font-semibold">{copy.seekerUi.guidance}</span>
            <InfoButton title={copy.seekerUi.guidance} body={copy.seekerUi.guidanceSheet} />
          </div>
        )}
      </div>
      <FilterBar countText={countLabel(cards.length, "retiree")} languages={languages} sort={sort} language={query.language} rating={query.rating === "4"} week={query.week === "1"} />
      <div className="px-5 pt-4">
        {cards.length ? <RetireeRows cards={cards} personaId={personaId} appNow={appNow} serviceTypeId={serviceTypeId} /> : (
          <div className="rounded-[20px] bg-white px-4 py-8 text-center">
            <EmptySearchIllustration className="mx-auto h-24 w-32" />
            <p className="mt-3 text-lg font-semibold">{copy.seekerUi.noRetirees}</p>
            <Link href={base} className="mt-3 inline-flex text-[15px] font-semibold text-gosi-blue">{copy.seekerUi.browseOther}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
