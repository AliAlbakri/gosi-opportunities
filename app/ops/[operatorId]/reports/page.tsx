import Link from "next/link";
import { listReports } from "@/lib/domain/reports";
import { getAppNow } from "@/lib/domain/clock";
import { formatDay } from "@/lib/format";

export default async function ReportsPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = await params;
  const [complaints, disputes, appNow] = await Promise.all([listReports("complaint"), listReports("dispute"), getAppNow()]);
  const Table = ({ rows }: { rows: typeof complaints }) => (
    <div className="space-y-2">
      {rows.map((row) => (
        <Link key={row.id} className="block rounded-2xl bg-white p-3" href={`/ops/${operatorId}/reports/${row.id}`}>
          {row.kind} · {row.reason} · {row.status}
          {row.due_by && new Date(row.due_by) < appNow && row.status === "open" && <span className="ml-2 rounded-full bg-gosi-amber-bg px-2 text-gosi-amber-text">Overdue</span>}
          {row.due_by && <span className="ml-2 text-xs">Due {formatDay(row.due_by)}</span>}
        </Link>
      ))}
      {!rows.length && <p>None yet.</p>}
    </div>
  );
  return (
    <div className="space-y-4">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Reports and disputes</h1>
      <h2 className="text-gosi-blue">Complaints</h2>
      <Table rows={complaints} />
      <h2 className="text-gosi-blue">Disputes</h2>
      <Table rows={disputes} />
    </div>
  );
}
