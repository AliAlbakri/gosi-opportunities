import { notFound, redirect } from "next/navigation";
import { SearchScreen } from "@/components/phone/seeker/search-screen";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { serviceIcons } from "@/lib/phone-icons";

export default async function SearchPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const appNow = await getAppNow();
  const { serviceTypes } = await catalog();
  const { cards } = await listRetireeCards({});
  return (
    <SearchScreen
      personaId={personaId}
      appNow={appNow.toISOString()}
      services={serviceTypes.map((type) => ({
        id: type.id,
        shortName: type.short_name,
        name: type.name,
        blurb: type.blurb,
        icon: serviceIcons[type.id] ?? "development",
        retirees: cards.filter((card) => card.services.some((service) => service.id === type.id)).length,
      }))}
      retirees={cards.map((card) => ({
        personId: card.personId,
        name: card.name,
        discipline: card.discipline,
        years: card.years,
        rating: card.rating,
        sessions: card.sessions,
        price: card.priceLabel,
        next: card.next?.toISOString() ?? null,
        description: card.services[0]?.description ?? "",
      }))}
    />
  );
}
