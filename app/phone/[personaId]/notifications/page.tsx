import Link from "next/link";
import { readAction } from "@/app/actions/flow";
import { getAppNow } from "@/lib/domain/clock";
import { listNotifications } from "@/lib/domain/notifications";
import { requireUser } from "@/lib/domain/personas";
import { relativeTo } from "@/lib/format";
import { notFound } from "next/navigation";

export default async function NotificationsPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [rows, appNow] = await Promise.all([listNotifications(personaId), getAppNow()]);
  return (
    <div className="space-y-2 p-4 text-gosi-rich-blue">
      <form action={async () => { "use server"; await readAction(personaId); }}><button className="text-sm text-gosi-blue" type="submit">Mark all read</button></form>
      {rows.map((row) => (
        <Link key={row.id} href={row.link || `/phone/${personaId}/home`} className={`block rounded-3xl bg-white p-4 ${row.read_at ? "" : "font-medium"}`}>
          <p>{row.title}</p>
          <p className="text-sm font-normal">{row.body}</p>
          <p className="text-xs text-gosi-midnight-50">{relativeTo(row.created_at, appNow)}</p>
        </Link>
      ))}
      {!rows.length && <p>No notifications yet.</p>}
    </div>
  );
}
