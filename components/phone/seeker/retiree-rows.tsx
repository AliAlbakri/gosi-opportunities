import Link from "next/link";
import { RetireeCard } from "@/components/phone/retiree-card";

type Card = {
  personId: string;
  name: string;
  discipline: string;
  years: number;
  rating: number | null;
  sessions: number;
  next: Date | null;
  priceLabel: string;
  services: { id: string; description: string; priceLabel: string }[];
};

export function RetireeRows({
  cards,
  personaId,
  appNow,
  serviceTypeId,
}: {
  cards: Card[];
  personaId: string;
  appNow: Date;
  serviceTypeId?: string;
}) {
  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const service = serviceTypeId ? card.services.find((item) => item.id === serviceTypeId) : undefined;
        return (
          <RetireeCard
            key={card.personId}
            variant="row"
            href={`/phone/${personaId}/opportunities/p/${card.personId}`}
            name={card.name}
            discipline={card.discipline}
            years={card.years}
            rating={card.rating}
            sessions={card.sessions}
            price={service?.priceLabel ?? card.priceLabel}
            next={card.next?.toISOString() ?? null}
            description={service?.description ?? card.services[0]?.description}
            appNow={appNow}
          />
        );
      })}
    </div>
  );
}

export function SeeAll({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="text-[15px] font-semibold text-gosi-blue">{label}</Link>;
}
