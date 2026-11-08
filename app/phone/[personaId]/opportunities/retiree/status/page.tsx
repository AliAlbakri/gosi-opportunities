import { notFound } from "next/navigation";
import { AddServiceForm } from "@/components/phone/profile-editors";
import { ResubmitForm } from "@/components/phone/resubmit-form";
import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { requireUser } from "@/lib/domain/personas";
import { getServiceTypes } from "@/lib/domain/settings";
import { REASON_CODES } from "@/lib/types";

export default async function StatusPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [profile, services, types] = await Promise.all([getProfile(user.person.id), getServiceRows(user.person.id), getServiceTypes()]);
  const names = new Map(types.map((row) => [row.id, row.name]));
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Application status</h1>
      <p className="capitalize">{profile?.state?.replaceAll("_", " ")}</p>
      {services.map((row) => (
        <article key={row.id} className="rounded-3xl bg-white p-4">
          <p className="font-medium">{names.get(row.service_type_id)}</p>
          <span className={`inline-block rounded-full px-2 py-1 text-xs ${row.status === "approved" ? "bg-gosi-green-10" : "bg-gosi-midnight-10"}`}>{row.status.replaceAll("_", " ")}</span>
          {row.reason_code && <p className="text-sm">{REASON_CODES[row.reason_code as keyof typeof REASON_CODES]} {row.reason_note}</p>}
        </article>
      ))}
      {!services.length && <p>No Service Types yet.</p>}
      <ResubmitForm personId={user.person.id} personaId={personaId} rows={services.filter((row) => row.status === "not_approved").map((row) => ({ id: row.id, description: row.description }))} />
      <AddServiceForm
        personId={user.person.id}
        personaId={personaId}
        types={types.filter((type) => !services.some((row) => row.service_type_id === type.id)).map((type) => ({ id: type.id, name: type.name }))}
      />
    </div>
  );
}
