import Link from "next/link";
import { notFound } from "next/navigation";
import { Layer2Editor } from "@/components/phone/profile-editors";
import { PriceEditor } from "@/components/phone/price-editor";
import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { publicProfile } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { getCategories, getServiceTypes, getSettings } from "@/lib/domain/settings";

export default async function RetireeProfilePage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [view, profile, services, settings, categories, types] = await Promise.all([
    publicProfile(user.person.id),
    getProfile(user.person.id),
    getServiceRows(user.person.id),
    getSettings(),
    getCategories(),
    getServiceTypes(),
  ]);
  const typeName = new Map(types.map((row) => [row.id, row.name]));
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Profile</h1>
      <p>Seekers see: {view?.person.full_name}</p>
      <p>{profile?.discipline_role}</p>
      <p>{profile?.intro}</p>
      <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/p/${user.person.id}`}>View as seekers see it</Link>
      <Layer2Editor
        personId={user.person.id}
        personaId={personaId}
        initial={{
          discipline: profile?.discipline_role ?? "",
          specializations: profile?.specializations ?? "",
          intro: profile?.intro ?? "",
          languages: profile?.languages ?? [],
        }}
      />
      {settings.paid_enabled && (
        <PriceEditor
          personId={user.person.id}
          personaId={personaId}
          floor={settings.price_floor}
          ceiling={settings.price_ceiling}
          rows={services.filter((row) => row.status === "approved").map((row) => ({
            id: row.id,
            name: typeName.get(row.service_type_id) ?? "Service Type",
            mode: row.pricing_mode,
            price: row.price,
            suggested: categories.find((category) => category.id === (row.service_type_id.startsWith("edu") ? "education" : "accounting"))?.suggested_price ?? 150,
          }))}
        />
      )}
    </div>
  );
}
