import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { publicProfile } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { yearsOfEmployment } from "@/lib/domain/rules";
import { formatWhen, money } from "@/lib/format";

export default async function ProfilePage({ params }: { params: Promise<{ personaId: string; retireeId: string }> }) {
  const { personaId, retireeId } = await params;
  const user = await requireUser(personaId);
  const profile = await publicProfile(retireeId);
  if (!user || !profile) notFound();
  const person = profile.person;
  const appNow = await getAppNow();
  const years = Math.round(yearsOfEmployment(profile.jobs, appNow));
  const lastActive = profile.jobs.reduce((year, job) => Math.max(year, Number((job.end_date ?? job.start_date).slice(0, 4))), 0);
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <Link href={`/phone/${personaId}/opportunities`}>Back</Link>
      <section className="rounded-3xl bg-gosi-rich-blue p-4 text-white">
        <p className="text-sm">{copy.verified}</p>
        <h1 className="text-2xl font-medium">{person.full_name}</h1>
        <p>Confirmed retiree · {years} years · last active {lastActive || "—"}</p>
        <p>{profile.profile.discipline_role}</p>
        {profile.profile.show_employers && profile.jobs.map((job) => (
          <p key={job.id} className="text-sm">{job.employer}{profile.profile.show_sector ? ` · ${job.sector}` : ""}{profile.profile.show_dates ? ` · ${job.start_date}` : ""}</p>
        ))}
      </section>
      <section className="rounded-3xl bg-gosi-midnight-10 p-4">
        <p className="text-sm">{copy.selfDeclared}</p>
        <p>{profile.profile.specializations}</p>
        <p>{(profile.profile.languages ?? []).join(", ")}</p>
        <p>{profile.profile.intro}</p>
        <p className="text-sm">{copy.docsProvided}</p>
        {profile.documents.map((doc) => <p key={doc.file_name}>{doc.file_name}</p>)}
      </section>
      <p>{profile.rating ? `${profile.rating.toFixed(1)} ★ · ${profile.sessions} sessions` : copy.newProfile}</p>
      {profile.reviews.map((review) => <blockquote key={review.text} className="rounded-2xl bg-white p-3">{review.text}<footer>{review.firstName} · {review.month}</footer></blockquote>)}
      {profile.services.map((service) => (
        <article key={service.id} className="rounded-3xl bg-white p-4">
          <h2 className="font-medium">{service.serviceType?.name}</h2>
          <p className="text-sm">{service.description}</p>
          <p>{profile.paidEnabled && service.pricing_mode === "paid" ? money(service.price) : "Free"}</p>
          <Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/p/${retireeId}/book?rst=${service.id}`}>Book</Link>
        </article>
      ))}
      <p className="text-sm">{copy.disclaimer}</p>
      <p>{profile.slots[0] ? `Next: ${formatWhen(profile.slots[0])}` : copy.fullyBooked}</p>
    </div>
  );
}
