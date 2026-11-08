import { notFound } from "next/navigation";
import { ReportActions } from "@/components/ops/report-actions";
import { evidence, getReport } from "@/lib/domain/reports";
import { formatLong } from "@/lib/format";
import { getAppNow } from "@/lib/domain/clock";

export default async function ReportDetail({ params }: { params: Promise<{ operatorId: string; reportId: string }> }) {
  const { operatorId, reportId } = await params;
  const report = await getReport(reportId);
  if (!report) notFound();
  const pack = await evidence(report.booking_id);
  const appNow = await getAppNow();
  const overdue = report.due_by && new Date(report.due_by) < appNow && report.status === "open";
  return (
    <div className="space-y-3">
      <h1 className="border-b-2 border-gosi-blue text-3xl">{report.kind}</h1>
      {overdue && <span className="rounded-full bg-gosi-amber-bg px-2 text-gosi-amber-text">Overdue</span>}
      <p>{report.reason}</p>
      <p>{report.description}</p>
      {report.due_by && <p>Due {formatLong(report.due_by)}</p>}
      <section className="rounded-2xl bg-white p-4">
        <h2 className="text-gosi-blue">Evidence</h2>
        <p>Need: {pack.booking?.seeker_need}</p>
        <p>Goal: {pack.booking?.seeker_goal}</p>
        <p>Price: {pack.booking?.price ?? "Free"}</p>
        {pack.events.map((event) => <p key={event.id}>{event.event} · {formatLong(event.at)}</p>)}
        {pack.feedback && <p>Rating {pack.feedback.rating} · {(pack.feedback.tags ?? []).join(", ")}</p>}
      </section>
      {report.status === "open" && <ReportActions operatorId={operatorId} reportId={reportId} kind={report.kind} />}
    </div>
  );
}
