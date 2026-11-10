import { notFound } from "next/navigation";
import { ResubmitForm } from "@/components/phone/resubmit-form";
import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { checklistDone } from "@/lib/domain/rules";
import { requireUser } from "@/lib/domain/personas";
import { getServiceTypes } from "@/lib/domain/settings";
import { copy } from "@/lib/copy";
import { REASON_CODES } from "@/lib/types";
import { AppHeader } from "@/components/phone/ui/header";
import { StatusPill } from "@/components/phone/ui/bits";
import { Timeline } from "@/components/phone/ui/flow";

const serviceStatus: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  not_approved: "Not approved",
  draft: "Draft",
};

export default async function StatusPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const [profile, services, types] = await Promise.all([getProfile(user.person.id), getServiceRows(user.person.id), getServiceTypes()]);
  const windows = profile?.state === "active" ? await listWindows(user.person.id) : [];
  const live = profile?.state === "active" && checklistDone(profile, windows.length);
  const reviewed = profile?.state === "active" || profile?.state === "not_approved" || profile?.state === "paused";
  const names = new Map(types.map((row) => [row.id, row.name]));
  return (
    <div className="space-y-3 px-5 py-2 text-gosi-rich-blue">
      <AppHeader title="Application status" />
      <Timeline items={[
        { title: "Submitted", state: profile?.submitted_at ? "done" : "upcoming" },
        { title: "Under review", state: profile?.state === "pending_review" ? "current" : reviewed ? "done" : "upcoming" },
        { title: "Get ready", state: live ? "done" : profile?.state === "active" ? "current" : "upcoming" },
        { title: "Live", state: live ? "current" : "upcoming" },
      ]} />
      {services.some((row) => row.status === "not_approved") ? null : (
        <p className="text-[15px] leading-[22px] text-gosi-midnight-50">{services.some((row) => row.status === "pending") || profile?.state === "pending_review" ? copy.statusHeld : copy.statusClosed}</p>
      )}
      {services.map((row) => (
        <article key={row.id} className="rounded-[20px] bg-white p-4">
          <p className="font-semibold">{names.get(row.service_type_id)}</p>
          <div className="mt-2"><StatusPill>{serviceStatus[row.status] ?? row.status}</StatusPill></div>
          {row.reason_code && <p className="mt-2 text-[13px] leading-[18px] text-gosi-midnight-80">{REASON_CODES[row.reason_code as keyof typeof REASON_CODES]}{row.reason_note ? ` ${row.reason_note}` : ""}</p>}
        </article>
      ))}
      {!services.length && <p className="text-[15px] text-gosi-midnight-50">No Service Types yet.</p>}
      <ResubmitForm personId={user.person.id} personaId={personaId} rows={services.filter((row) => row.status === "not_approved").map((row) => ({ id: row.id, description: row.description }))} />
    </div>
  );
}
