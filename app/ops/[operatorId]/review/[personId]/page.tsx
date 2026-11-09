import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/ops/decision-form";
import { OperatorDocuments } from "@/components/ops/documents";
import { reviewDetail } from "@/lib/domain/review";

const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  not_approved: "Not approved",
};

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
      <section className="space-y-2 rounded-2xl bg-white p-4">
        <h2 className="text-gosi-blue">What seekers will see</h2>
        <p className="text-sm text-gosi-midnight-80">Read this before you approve. Approving a Service Type publishes that name, its description, and the text below.</p>
        <p className="text-sm text-gosi-midnight-50">Role</p>
        <p>{detail.profile.discipline_role}</p>
        <p className="text-sm text-gosi-midnight-50">Introduction</p>
        <p>{detail.profile.intro || "None"}</p>
        <p className="text-sm text-gosi-midnight-50">Languages</p>
        <p>{(detail.profile.languages ?? []).join(", ") || "None"}</p>
      </section>
      <OperatorDocuments documents={detail.documents} />
      {detail.services.map((row) => (
        <article key={row.id} className="space-y-2 rounded-2xl bg-white p-4">
          <p className="text-sm text-gosi-midnight-50">Service Type · seekers see this name</p>
          <h2>{row.serviceType?.name}</h2>
          <p className="text-sm text-gosi-midnight-50">Description · seekers see this text</p>
          <p className="text-sm">{row.description}</p>
          {row.status === "pending" ? <DecisionForm operatorId={operatorId} rstId={row.id} /> : <p className="text-sm">{statusLabel[row.status] ?? row.status}</p>}
        </article>
      ))}
    </div>
  );
}
