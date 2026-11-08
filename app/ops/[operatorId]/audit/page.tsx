import { auditLog } from "@/lib/domain/ops";
import { formatLong } from "@/lib/format";

export default async function AuditPage() {
  const rows = await auditLog();
  return (
    <div>
      <h1 className="mb-4 border-b-2 border-gosi-blue text-3xl">Audit log</h1>
      <table className="w-full bg-white text-left text-sm">
        <thead className="bg-gosi-rich-blue text-white"><tr><th className="p-2">When</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id} className="border-t"><td className="p-2">{formatLong(row.at)}</td><td>{row.actor}</td><td>{row.action}</td><td>{row.entity}</td></tr>)}
        </tbody>
      </table>
      {!rows.length && <p>No actions yet.</p>}
    </div>
  );
}
