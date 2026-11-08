import Link from "next/link";
import { notFound } from "next/navigation";
import { watchAction } from "@/app/actions/flow";
import { ReadinessButton } from "@/components/phone/readiness";
import { getProfile } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { requireUser } from "@/lib/domain/personas";

export default async function ChecklistPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [profile, windows] = await Promise.all([getProfile(user.person.id), listWindows(user.person.id)]);
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">Go live</h1>
      <form action={async () => { "use server"; await watchAction(user.person.id, personaId); }}>
        <button className="w-full rounded-3xl bg-white p-4 text-left" type="submit">{profile?.onboarding_watched_at ? "Onboarding video watched" : "Mark the onboarding video as watched"}</button>
      </form>
      <ReadinessButton personaId={personaId} personId={user.person.id} name={user.person.first_name} done={Boolean(profile?.readiness_passed_at)} />
      <Link className="block rounded-3xl bg-white p-4" href={`/phone/${personaId}/opportunities/retiree/availability`}>{windows.length ? "Availability is set" : "Set your availability"}</Link>
    </div>
  );
}
