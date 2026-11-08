import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/ops/decision-form";
import { reviewDetail } from "@/lib/domain/review";

export default async function ReviewDetail({ params }: { params: Promise<{ operatorId: string; personId: string }> }) {
  const { operatorId, personId } = await params;
  const detail = await reviewDetail(personId);
  if (!detail.person || !detail.profile) notFound();
  return (
    <div className="space-y-4">
      <h1 className="border-b-2 border-gosi-blue text-3xl">{detail.person.full_name}</h1>
      <p>{detail.person.mobile}</p>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="text-gosi-blue">Verified by GOSI</h2>
        {detail.jobs.map((job) => <p key={job.id}>{job.employer} · {job.sector} · {job.start_date}</p>)}
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="text-gosi-blue">Self-declared</h2>
        <p>{detail.profile.discipline_role}</p>
        <p>{detail.profile.specializations}</p>
        <p>{detail.profile.intro}</p>
        <p>{(detail.profile.languages ?? []).join(", ")}</p>
        {detail.documents.map((doc) => <a key={doc.id} className="block text-gosi-blue" href={doc.url}>{doc.file_name}</a>)}
      </section>
      {detail.services.filter((row) => row.status === "pending").map((row) => (
        <article key={row.id} className="rounded-2xl bg-white p-4">
          <h2>{row.serviceType?.name}</h2>
          <p className="text-sm">{row.description}</p>
          <DecisionForm operatorId={operatorId} rstId={row.id} />
        </article>
      ))}
    </div>
  );
}
