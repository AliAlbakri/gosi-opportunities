import { InvitationsPanel } from "@/components/ops/invitations-panel";
import { filterOptions, listWaves } from "@/lib/domain/invitations";

export default async function InvitationsPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = await params;
  const [options, waves] = await Promise.all([filterOptions(), listWaves()]);
  return (
    <div className="space-y-4">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Invitations</h1>
      <InvitationsPanel operatorId={operatorId} regions={options.regions} sectors={options.sectors} />
      <table className="w-full bg-white text-sm">
        <thead className="bg-gosi-rich-blue text-left text-white"><tr>{["Wave", "Invited", "Opened", "Started", "Submitted", "Approved", "Delivered"].map((col) => <th key={col} className="p-2">{col}</th>)}</tr></thead>
        <tbody>
          {waves.map((wave) => (
            <tr key={wave.id} className="border-t">
              <td className="p-2">{wave.name}</td>
              <td>{wave.stats.invited}</td><td>{wave.stats.opened}</td><td>{wave.stats.started}</td><td>{wave.stats.submitted}</td><td>{wave.stats.approved}</td><td>{wave.stats.delivered}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
