import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BrandIcon } from "@/components/phone/brand-icon";
import { copy } from "@/lib/copy";
import { getProfile } from "@/lib/domain/applications";
import { listWindows } from "@/lib/domain/availability";
import { aggregateForRetiree } from "@/lib/domain/discovery";
import { getInvitation, markInvitationOpened } from "@/lib/domain/invitations";
import { requireUser } from "@/lib/domain/personas";
import { getAppNow } from "@/lib/domain/clock";
import { checklistDone } from "@/lib/domain/rules";
import { getSettings } from "@/lib/domain/settings";
import { decorateBookings } from "@/lib/domain/hydrate";
import { eventsForBooking, phaseFor } from "@/lib/domain/sessions";
import { formatRemain } from "@/lib/domain/sessionPhase";
import { formatWhen, TZ } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";
import { admin } from "@/lib/supabase/admin";
import { StatusPill } from "@/components/phone/ui/bits";
import { AppHeader } from "@/components/phone/ui/header";
import type { Booking } from "@/lib/types";

export default async function RetireeHome({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user?.person.is_retiree) notFound();
  const invitation = await getInvitation(user.person.id);
  if (!invitation) {
    return (
      <div className="space-y-4 px-5 py-2 text-gosi-rich-blue">
        <AppHeader title="GOSI Opportunities" />
        <BrandIcon name="partnership" className="h-12 w-12" />
        <h1 className="text-2xl font-medium">GOSI Opportunities</h1>
        <p>{copy.notInvitedBody}</p>
        <Link className="inline-flex rounded-full bg-gosi-rich-blue px-4 py-2 text-sm text-white" href={`/phone/${personaId}/home`}>Back home</Link>
      </div>
    );
  }
  await markInvitationOpened(user.person.id);
  const profile = await getProfile(user.person.id);
  if (!profile || profile.state === "draft") {
    const step = profile?.application_step ?? 1;
    const started = Boolean(profile);
    return (
      <div className="space-y-4 px-5 py-2 text-gosi-rich-blue">
        <AppHeader title="GOSI Opportunities" />
        <BrandIcon name="partnership" className="h-12 w-12" />
        <h1 className="text-2xl font-medium">{copy.welcomeTitle}</h1>
        <p>{copy.welcomeBody}</p>
        {started && <p className="text-sm">{step} of 5 steps</p>}
        <Link className="inline-flex rounded-full bg-gosi-vivid-green px-4 py-2 text-sm text-gosi-rich-blue" href={`/phone/${personaId}/opportunities/retiree/apply`}>
          {started ? "Continue" : copy.startApplication}
        </Link>
      </div>
    );
  }
  if (profile.state === "pending_review" || profile.state === "not_approved") {
    redirect(`/phone/${personaId}/opportunities/retiree/status`);
  }
  const [windows, rating, settings, appNow] = await Promise.all([listWindows(user.person.id), aggregateForRetiree(user.person.id), getSettings(), getAppNow()]);
  if (profile.state === "active" && !checklistDone(profile, windows.length)) redirect(`/phone/${personaId}/opportunities/retiree/checklist`);
  const windowStart = new Date(appNow.getTime() - 30 * 60 * 1000).toISOString();
  const { data: nextRow } = await admin().from("bookings").select("*").eq("retiree_id", user.person.id).eq("status", "confirmed").gt("ends_at", windowStart).order("starts_at").limit(1).maybeSingle();
  const next = nextRow ? (await decorateBookings([nextRow as Booking]))[0] : null;
  const events = next ? await eventsForBooking(next.id) : [];
  const phase = next ? phaseFor(next, events, user.person.id, appNow) : null;
  const live = phase?.join === "now" || phase?.join === "rejoin";
  const locked = phase?.phase === "soon"
    ? `${copy.session.joinIn} ${formatRemain(phase.opensAt.getTime() - appNow.getTime())}`
    : phase ? `${copy.session.joinAt} ${formatInTimeZone(phase.opensAt, TZ, "HH:mm")}` : "";
  const base = `/phone/${personaId}/opportunities`;
  const tabs = [
    { label: "Sessions", href: "sessions", icon: "calendar" },
    { label: "Availability", href: "availability", icon: "phone" },
    { label: "Profile", href: "profile", icon: "individual-m" },
    ...(settings.paid_enabled ? [{ label: "Earnings", href: "earnings", icon: "financial-investment" }] : []),
    { label: "Notes", href: "notes", icon: "letter" },
  ];
  return (
    <div className="space-y-3 px-5 py-2 text-gosi-rich-blue">
      <AppHeader title="GOSI Opportunities" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{profile.state === "paused" ? "Your profile is paused" : `Hello, ${user.person.first_name}`}</h1>
        <StatusPill>{profile.state === "paused" || !profile.accepting_bookings ? "Paused" : "Live"}</StatusPill>
      </div>
      <Link href={next ? (live ? `${base}/bookings/${next.id}/lobby` : `${base}/bookings/${next.id}`) : `${base}/retiree/sessions`} className={`block rounded-[20px] p-4 ${live ? "bg-gosi-vivid-green text-gosi-rich-blue" : "bg-gosi-rich-blue text-white"}`}>
        <p className={`text-[13px] ${live ? "text-gosi-rich-blue/70" : "text-white/80"}`}>Next session</p>
        <p className="text-lg font-semibold">{next ? formatWhen(next.starts_at) : "No upcoming sessions"}</p>
        {next?.seeker_need && <p className={`mt-2 line-clamp-2 text-[15px] ${live ? "" : "text-white/80"}`}>{next.seeker_need}</p>}
        {phase && (
          <p className="mt-3 text-[15px] font-semibold">
            {live && <span className="mr-2 inline-flex h-2.5 w-2.5 rounded-full bg-gosi-rich-blue align-middle" />}
            {live ? (phase.otherInCall ? `${next?.seekerName} ${copy.session.waiting}` : copy.session.joinNow) : phase.join === "locked" ? locked : copy.session.completeTitle}
          </p>
        )}
      </Link>
      <div className="grid grid-cols-3 gap-2 rounded-[20px] bg-white p-3 text-center text-[13px]">
        <p><span className="block text-lg font-semibold">{rating.sessions}</span>sessions</p>
        <p><span className="block text-lg font-semibold">{rating.rating ? rating.rating.toFixed(1) : "New"}</span>rating</p>
        <p><span className="block text-lg font-semibold">{windows.length}</span>windows</p>
      </div>
      <Link className="text-[15px] font-semibold text-gosi-blue" href={`/phone/${personaId}/opportunities/retiree/about`}>About the programme</Link>
      <div className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => (
          <Link key={tab.href} className="flex flex-col items-start gap-2 rounded-3xl bg-white p-4" href={`/phone/${personaId}/opportunities/retiree/${tab.href}`}>
            <BrandIcon name={tab.icon} className="h-8 w-8" />
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
