import { notFound } from "next/navigation";
import { notesFor } from "@/lib/domain/ops";
import { requireUser } from "@/lib/domain/personas";
import { formatWhen } from "@/lib/format";

export default async function NotesPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const notes = await notesFor(user.person.id);
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Notes from GOSI</h1>
      {notes.map((note) => <article key={note.id} className="rounded-3xl bg-white p-4"><p>{note.body}</p><p className="text-xs">{formatWhen(note.sent_at)}</p></article>)}
      {!notes.length && <p>No notes yet.</p>}
    </div>
  );
}
