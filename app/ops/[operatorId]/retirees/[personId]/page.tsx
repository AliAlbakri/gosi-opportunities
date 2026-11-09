import { notFound } from "next/navigation";
import { OperatorDocuments } from "@/components/ops/documents";
import { RetireeActions } from "@/components/ops/retiree-actions";
import { getProfile, operatorDocuments } from "@/lib/domain/applications";
import { notesFor } from "@/lib/domain/ops";
import { getPerson } from "@/lib/domain/personas";
import { admin } from "@/lib/supabase/admin";
import { formatLong } from "@/lib/format";

export default async function RetireeDetail({ params }: { params: Promise<{ operatorId: string; personId: string }> }) {
  const { operatorId, personId } = await params;
  const [person, profile, notes, audit, documents] = await Promise.all([
    getPerson(personId),
    getProfile(personId),
    notesFor(personId),
    admin().from("audit_log").select("*").eq("entity_id", personId).order("at", { ascending: false }),
    operatorDocuments(personId),
  ]);
  if (!person || !profile) notFound();
  return (
    <div className="space-y-4">
      <h1 className="border-b-2 border-gosi-blue text-3xl">{person.full_name}</h1>
      <p>{person.mobile} · {profile.state}</p>
      <RetireeActions operatorId={operatorId} personId={personId} paused={profile.state === "paused"} />
      <OperatorDocuments documents={documents} />
      <section>
        <h2 className="text-gosi-blue">Notes sent</h2>
        {notes.map((note) => <p key={note.id}>{formatLong(note.sent_at)} · {note.body}</p>)}
      </section>
      <section>
        <h2 className="text-gosi-blue">History</h2>
        {(audit.data ?? []).map((row) => <p key={row.id}>{formatLong(row.at)} · {row.action} · {row.actor}</p>)}
      </section>
    </div>
  );
}
