import { copy } from "@/lib/copy";
import { formatSpan } from "@/lib/format";

export type PreviewJob = { id: string; employer: string; sector: string; start_date: string; end_date: string | null };

export function pensionLabel(value: string) {
  if (value === "private") return "Private";
  if (value === "public") return "Public";
  if (value === "combined") return "Combined";
  return value;
}

export function seekerJobLine(job: PreviewJob, show: { employers: boolean; dates: boolean; sector: boolean }) {
  const employer = show.employers && job.employer && job.employer !== "Earlier employer" ? job.employer : "";
  const parts = [employer, show.sector ? job.sector : "", show.dates ? formatSpan(job.start_date, job.end_date) : ""].filter(Boolean);
  return parts.join(" · ");
}

export function SeekerRecordPreview({
  name,
  pension,
  years,
  lastActive,
  jobs,
  showEmployers,
  showDates,
  showSector,
}: {
  name: string;
  pension: string;
  years: number;
  lastActive: string;
  jobs: PreviewJob[];
  showEmployers: boolean;
  showDates: boolean;
  showSector: boolean;
}) {
  const lines = jobs
    .map((job) => ({ id: job.id, line: seekerJobLine(job, { employers: showEmployers, dates: showDates, sector: showSector }) }))
    .filter((row) => row.line);
  return (
    <div className="space-y-1 rounded-3xl bg-gosi-midnight-10 p-4 text-sm">
      <p className="text-[13px] font-medium text-gosi-blue">{copy.seekerPreview}</p>
      <p className="font-medium">{name}</p>
      <p>Confirmed retiree · {pensionLabel(pension)}</p>
      <p>{years} years of experience · last active {lastActive}</p>
      {lines.map((row) => <p key={row.id}>{row.line}</p>)}
      {!lines.length && <p className="text-gosi-midnight-80">Employer names, dates, and sector stay hidden.</p>}
    </div>
  );
}
