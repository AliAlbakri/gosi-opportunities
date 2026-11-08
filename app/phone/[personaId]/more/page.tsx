import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/domain/personas";

export default async function MorePage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">More</h1>
      <Link className="block rounded-3xl bg-white p-4" href={`/phone/${personaId}/notifications`}>Notifications</Link>
      <Link className="block rounded-3xl bg-white p-4" href="/phone">Log out</Link>
    </div>
  );
}
