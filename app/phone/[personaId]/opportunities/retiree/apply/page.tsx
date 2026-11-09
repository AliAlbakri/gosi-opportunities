import { notFound } from "next/navigation";
import { Wizard } from "@/components/phone/wizard";
import { applicationBundle, signedDocumentUrl } from "@/lib/domain/applications";
import { getInvitation, markInvitationOpened } from "@/lib/domain/invitations";
import { requireUser } from "@/lib/domain/personas";

export default async function ApplyPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const invitation = await getInvitation(user.person.id);
  if (!invitation) notFound();
  await markInvitationOpened(user.person.id);
  const bundle = await applicationBundle(user.person.id);
  if (!bundle.person) notFound();
  let photoUrl: string | null = null;
  if (bundle.profile?.photo_path) {
    try { photoUrl = await signedDocumentUrl(bundle.profile.photo_path); } catch { photoUrl = null; }
  }
  return (
    <Wizard
      personaId={personaId}
      personId={user.person.id}
      initialStep={bundle.profile?.application_step ?? 1}
      record={{
        name: bundle.person.full_name,
        pension: bundle.person.pension_system ?? "retiree",
        years: bundle.years,
        lastActive: bundle.jobs.reduce((year, job) => Math.max(year, Number((job.end_date ?? job.start_date).slice(0, 4))), 0).toString(),
      }}
      jobs={bundle.jobs.map((job) => ({ id: job.id, employer: job.employer, sector: job.sector, start_date: job.start_date, end_date: job.end_date }))}
      documents={bundle.documents.map((doc) => ({ id: doc.id, kind: doc.kind, file_name: doc.file_name }))}
      photoUrl={photoUrl}
      initial={{
        showEmployers: bundle.profile?.show_employers ?? true,
        showDates: bundle.profile?.show_dates ?? true,
        showSector: bundle.profile?.show_sector ?? true,
        discipline: bundle.profile?.discipline_role ?? "",
        specializations: bundle.profile?.specializations ?? "",
        intro: bundle.profile?.intro ?? "",
        languages: bundle.profile?.languages ?? [],
        offers: bundle.services.filter((row) => row.status === "draft" || row.status === "not_approved").map((row) => ({ serviceTypeId: row.service_type_id, description: row.description })),
      }}
      categories={bundle.categories}
      serviceTypes={bundle.serviceTypes}
    />
  );
}
