import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/phone/ui/header";
import { Card, EmptyState } from "@/components/phone/ui/bits";
import { RetireeCard } from "@/components/phone/retiree-card";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { catalog, listRetireeCards } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";

export default async function ServiceTypePage({ params }: { params: Promise<{ personaId: string; serviceTypeId: string }> }) {
  const { personaId, serviceTypeId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  if (user.person.is_retiree) redirect(`/phone/${personaId}/opportunities/retiree`);
  const { serviceTypes } = await catalog();
  const type = serviceTypes.find((row) => row.id === serviceTypeId);
  if (!type) notFound();
  const appNow = await getAppNow();
  const { cards } = await listRetireeCards({ serviceTypeId });
  return (
    <div className="space-y-4 px-5 py-2 pb-8 text-gosi-rich-blue">
      <AppHeader title={type.name} />
      <Card>
        <p className="text-[15px]">{type.name}</p>
        <p className="mt-2 text-[13px] text-gosi-midnight-50">{copy.disclaimer}</p>
      </Card>
      <p className="text-[13px] text-gosi-midnight-50">{cards.length} retirees</p>
      {cards.map((card) => <RetireeCard key={card.personId} href={`/phone/${personaId}/opportunities/p/${card.personId}`} name={card.name} discipline={card.discipline} languages={card.languages} rating={card.rating} sessions={card.sessions} price={card.priceLabel} next={card.next?.toISOString() ?? null} appNow={appNow} />)}
      {!cards.length && <EmptyState title="No retirees yet" text="Try another service." />}
    </div>
  );
}
