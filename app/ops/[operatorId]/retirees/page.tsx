import Link from "next/link";
import { monitoringList } from "@/lib/domain/ops";
import { formatDay, money } from "@/lib/format";

export default async function RetireesPage({ params, searchParams }: { params: Promise<{ operatorId: string }>; searchParams: Promise<{ status?: string; q?: string }> }) {
  const { operatorId } = await params;
  const query = await searchParams;
  const all = await monitoringList();
  const rows = all.filter((row) => {
    const statusOk = !query.status || row.status === query.status;
    const text = `${row.name} ${row.mobile}`.toLowerCase();
    return statusOk && (!query.q || text.includes(query.q.toLowerCase()));
  });
  const paid = all[0]?.paidEnabled;
  return (
    <div className="space-y-3">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Retirees</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={query.q} placeholder="Name or mobile" className="h-10 rounded-xl border px-3" />
        <select name="status" defaultValue={query.status ?? ""} className="h-10 rounded-xl border px-2">
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
        </select>
        <button className="rounded-full bg-gosi-vivid-green px-4 text-gosi-rich-blue" type="submit">Filter</button>
      </form>
      {paid && <span className="rounded-full bg-gosi-amber-bg px-2 py-1 text-xs text-gosi-amber-text">Paid switch</span>}
      <div className="overflow-x-auto">
        <table className="w-full bg-white text-left text-xs">
          <thead className="bg-gosi-rich-blue text-white">
            <tr>
              {["Name", "Mobile", "Status", "Service Types", "Approved", "Delivered", "Rating", "Missed", "Late cancellations", "Complaints", "Last session", ...(paid ? ["Disputes", "Held", "Released", "Paid out"] : [])].map((col) => <th key={col} className="p-2">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.personId} className="border-t border-gosi-row-border odd:bg-gosi-zebra">
                <td className="p-2"><Link className="text-gosi-blue" href={`/ops/${operatorId}/retirees/${row.personId}`}>{row.name}</Link></td>
                <td>{row.mobile}</td>
                <td>{row.status}</td>
                <td>{row.services.join(", ")}</td>
                <td>{row.approvedAt ? formatDay(row.approvedAt) : ""}</td>
                <td>{row.delivered}</td>
                <td>{row.rating ? row.rating.toFixed(1) : ""}</td>
                <td>{row.missed}</td>
                <td>{row.late}</td>
                <td>{row.complaints}</td>
                <td>{row.lastSession ? formatDay(row.lastSession) : ""}</td>
                {paid && <td>{row.disputes}</td>}
                {paid && <td>{money(row.held)}</td>}
                {paid && <td>{money(row.released)}</td>}
                {paid && <td>{money(row.paidOut)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p>No active or paused retirees yet.</p>}
    </div>
  );
}
