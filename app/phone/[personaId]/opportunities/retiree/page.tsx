import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { aggregateForRetiree } from "@/lib/domain/discovery";
import { getInvitation, markInvitationOpened } from "@/lib/domain/invitations";
import { requireUser } from "@/lib/domain/personas";
import { checklistDone } from "@/lib/domain/rules";
import { getSettings } from "@/lib/domain/settings";

export default async function RetireeHome({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user?.person.is_retiree) notFound();
  const invitation = await getInvitation(user.person.id);
  if (!invitation) {
    return <div className="p-4 text-gosi-rich-blue"><p>The retiree area opens after an invitation.</p><Link href={`/phone/${personaId}/home`}>Back home</Link></div>;
  }
  await markInvitationOpened(user.person.id);
  const profile = await getProfile(user.person.id);
  if (!profile || profile.state === "draft") {
    return <div className="p-4"><Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/retiree/apply`}>Start your application</Link></div>;
  }
  if (profile.state === "pending_review" || profile.state === "not_approved") {
    return <div className="p-4"><Link className="text-gosi-blue" href={`/phone/${personaId}/opportunities/retiree/status`}>View your application</Link></div>;
  }
  const [windows, services, rating, settings] = await Promise.all([listWindows(user.person.id), getServiceRows(user.person.id), aggregateForRetiree(user.person.id), getSettings()]);
  const live = checklistDone(profile, windows.length) && services.some((row) => row.status === "approved");
  const tabs = [
    ["Sessions", "sessions"],
    ["Availability", "availability"],
    ["Profile", "profile"],
    ...(settings.paid_enabled ? [["Earnings", "earnings"]] : []),
    ["Notes", "notes"],
  ];
  return (
    <div className="space-y-3 p-4 text-gosi-rich-blue">
      <h1 className="text-2xl font-medium">{profile.state === "paused" ? "Your profile is paused" : "Your GOSI Opportunities"}</h1>
      <p>{rating.rating ? `${rating.rating.toFixed(1)} ★ from ${rating.sessions} sessions` : "New, no ratings yet"}</p>
      {!live && profile.state === "active" && <Link className="block rounded-3xl bg-gosi-green-10 p-4" href={`/phone/${personaId}/opportunities/retiree/checklist`}>Finish going live</Link>}
      <div className="grid grid-cols-2 gap-2">
        {tabs.map(([label, href]) => (
          <Link key={href} className="rounded-3xl bg-white p-4" href={`/phone/${personaId}/opportunities/retiree/${href}`}>{label}</Link>
        ))}
      </div>
    </div>
  );
}
