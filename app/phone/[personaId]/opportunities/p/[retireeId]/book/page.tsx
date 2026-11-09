import { notFound } from "next/navigation";
import { BookForm } from "@/components/phone/book-form";
import { getAppNow } from "@/lib/domain/clock";
import { openSlots } from "@/lib/domain/bookings";
import { publicProfile } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { ageInRiyadh, money } from "@/lib/format";
import { copy } from "@/lib/copy";

export default async function BookPage({ params, searchParams }: { params: Promise<{ personaId: string; retireeId: string }>; searchParams: Promise<{ rst?: string }> }) {
  const { personaId, retireeId } = await params;
  const query = await searchParams;
  const user = await requireUser(personaId);
  const profile = await publicProfile(retireeId);
  if (!user || !profile) notFound();
  const appNow = await getAppNow();
  if (ageInRiyadh(user.person.birth_date, appNow) < 18) return <p className="p-4">{copy.under18}</p>;
  const slots = await openSlots(retireeId, user.person.id);
  const services = profile.services.map((service) => ({
    id: service.id,
    name: service.serviceType?.name ?? "Session",
    description: service.description,
    priceLabel: profile.paidEnabled && service.pricing_mode === "paid" ? money(service.price) : "Free",
  }));
  return <BookForm personaId={personaId} seekerId={user.person.id} birthDate={user.person.birth_date} retireeId={retireeId} retireeName={profile.person.full_name} services={services} slots={slots.map((slot) => slot.toISOString())} initialService={query.rst} />;
}
