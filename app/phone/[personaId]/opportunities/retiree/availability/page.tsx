import { notFound } from "next/navigation";
import { AvailabilityEditor } from "@/components/phone/availability-editor";
import { getProfile } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { requireUser } from "@/lib/domain/personas";

export default async function AvailabilityPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [profile, windows] = await Promise.all([getProfile(user.person.id), listWindows(user.person.id)]);
  return (
    <AvailabilityEditor
      personId={user.person.id}
      personaId={personaId}
      accepting={profile?.accepting_bookings ?? true}
      paused={profile?.state === "paused"}
      initial={windows.map((row) => ({ weekday: row.weekday, start: String(row.start_time).slice(0, 5), end: String(row.end_time).slice(0, 5) }))}
    />
  );
}
