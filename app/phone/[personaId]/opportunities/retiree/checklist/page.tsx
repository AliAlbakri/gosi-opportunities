import Link from "next/link";
import { notFound } from "next/navigation";
import { watchAction } from "@/app/actions/flow";
import { BrandIcon } from "@/components/phone/brand-icon";
import { AppHeader } from "@/components/phone/ui/header";
import { ReadinessButton } from "@/components/phone/readiness";
import { copy } from "@/lib/copy";
import { getProfile } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { requireUser } from "@/lib/domain/personas";
import { checklistDone } from "@/lib/domain/rules";

export default async function ChecklistPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [profile, windows] = await Promise.all([getProfile(user.person.id), listWindows(user.person.id)]);
  const watched = Boolean(profile?.onboarding_watched_at);
  const ready = Boolean(profile?.readiness_passed_at);
  const available = windows.length > 0;
  if (profile && checklistDone(profile, windows.length)) {
    return (
      <div className="space-y-4 p-4 text-gosi-rich-blue">
        <BrandIcon name="partnership" className="h-12 w-12" />
        <h1 className="text-2xl font-medium">{copy.youreLive}</h1>
        <p>Seekers can now book a session with you.</p>
        <Link className="inline-flex rounded-full bg-gosi-vivid-green px-4 py-2 text-sm text-gosi-rich-blue" href={`/phone/${personaId}/opportunities/retiree`}>Open your sessions</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4 px-5 py-2 text-gosi-rich-blue">
      <AppHeader title="Almost live" />
      <p className="text-[15px] font-semibold">{[watched, ready, available].filter(Boolean).length} of 3 steps done</p>
      <p className="text-sm">Finish these three steps before seekers can book you.</p>
      <ol className="space-y-3">
        <li className="rounded-3xl bg-white p-4">
          <div className="flex items-center gap-3">
            <BrandIcon name="development" className="h-8 w-8" />
            <div>
              <p className="text-xs text-gosi-midnight-50">1</p>
              <p className="font-medium">Watch the guide</p>
            </div>
          </div>
          <form className="mt-3" action={async () => { "use server"; await watchAction(user.person.id, personaId); }}>
            <button className="rounded-full bg-gosi-vivid-green px-4 py-2 text-sm text-gosi-rich-blue" type="submit">{watched ? "Onboarding video watched" : "Mark the onboarding video as watched"}</button>
          </form>
        </li>
        <li className="space-y-2">
          <div className="flex items-center gap-3 px-1">
            <BrandIcon name="phone" className="h-8 w-8" />
            <div>
              <p className="text-xs text-gosi-midnight-50">2</p>
              <p className="font-medium">Pass the readiness call</p>
            </div>
          </div>
          <ReadinessButton personaId={personaId} personId={user.person.id} name={user.person.first_name} done={ready} />
        </li>
        <li className="rounded-3xl bg-white p-4">
          <div className="flex items-center gap-3">
            <BrandIcon name="calendar" className="h-8 w-8" />
            <div>
              <p className="text-xs text-gosi-midnight-50">3</p>
              <p className="font-medium">Set your availability</p>
            </div>
          </div>
          <Link className="mt-3 inline-flex rounded-full bg-gosi-rich-blue px-4 py-2 text-sm text-white" href={`/phone/${personaId}/opportunities/retiree/availability`}>
            {available ? "Availability is set" : "Set your availability"}
          </Link>
        </li>
      </ol>
    </div>
  );
}
