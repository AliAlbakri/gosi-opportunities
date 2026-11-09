import { overview } from "@/lib/domain/ops";
import { formatLong } from "@/lib/format";

export default async function OverviewPage() {
  const data = await overview();
  const cards = [
    ["Invited", data.invited],
    ["Drafts", data.drafts],
    ["Pending review", data.pending],
    ["Active", data.active],
    ["Paused", data.paused],
    ["Upcoming sessions", data.upcoming],
    ["Open disputes", data.disputes],
    ["Overdue disputes", data.overdue],
  ];
  return (
    <div className="space-y-4">
      <h1 className="border-b-2 border-gosi-blue pb-1 text-3xl text-gosi-rich-blue">Overview</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-white p-4"><p className="text-sm text-gosi-midnight-50">{label}</p><p className="text-2xl">{value}</p></div>)}
      </div>
      <table className="w-full overflow-hidden rounded-2xl bg-white text-sm">
        <thead className="bg-gosi-rich-blue text-white"><tr><th className="p-2 text-left">When</th><th className="p-2 text-left">Action</th><th>Actor</th></tr></thead>
        <tbody>
          {data.audit.map((row, index) => <tr key={row.id} className={`border-t border-gosi-row-border ${index % 2 ? "bg-gosi-midnight-10" : ""}`}><td className="p-2">{formatLong(row.at)}</td><td>{row.action}</td><td>{row.actor}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
