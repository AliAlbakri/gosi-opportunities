import Link from "next/link";
import { DemoButton } from "@/components/shared/demo-toast";
import { copy } from "@/lib/copy";
import { getProfile, getServiceRows } from "@/lib/domain/applications";
import { getAppNow } from "@/lib/domain/clock";
import { getInvitation } from "@/lib/domain/invitations";
import { unreadCount } from "@/lib/domain/notifications";
import { requireUser } from "@/lib/domain/personas";
import { ageInRiyadh, formatWhen, greeting } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  const appNow = await getAppNow();
  const [invitation, profile, services, unread] = await Promise.all([
    user.person.is_retiree ? getInvitation(user.person.id) : Promise.resolve(null),
    user.person.is_retiree ? getProfile(user.person.id) : Promise.resolve(null),
    user.person.is_retiree ? getServiceRows(user.person.id) : Promise.resolve([]),
    unreadCount(personaId),
  ]);
  const { data: next } = profile?.state === "active"
    ? await admin().from("bookings").select("starts_at").eq("retiree_id", user.person.id).eq("status", "confirmed").gt("starts_at", appNow.toISOString()).order("starts_at").limit(1).maybeSingle()
    : { data: null };
  const step = profile?.application_step ?? 1;
  const hour = greeting(appNow);
  const retireeCard = invitation ? retireeCopy(profile?.state ?? "invited", step, next?.starts_at ?? null) : null;

  return (
    <div className="space-y-4 px-4 pb-6">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gosi-midnight text-white">{user.person.first_name[0]}</span>
          <div>
            <p className="text-sm text-gosi-midnight-50">{hour},</p>
            <p className="text-lg font-medium uppercase text-gosi-rich-blue">{user.person.first_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/phone/${personaId}/notifications`} className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-gosi-rich-blue">Bell{unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gosi-vivid-green" />}</Link>
          <DemoButton className="grid h-12 w-12 place-items-center rounded-full bg-white">Search</DemoButton>
        </div>
      </header>
      <DemoButton className="block w-full rounded-3xl border border-gosi-purple bg-[#F4EEFF] p-4 text-left text-gosi-rich-blue">
        Congratulations on your work anniversary. Your dedication shines.
      </DemoButton>
      <div className="grid grid-cols-[120px_1fr] gap-3">
        <DemoButton className="h-36 rounded-3xl bg-gosi-blue text-white">Story</DemoButton>
        <DemoButton className="rounded-3xl bg-white p-3 text-left text-gosi-rich-blue">
          <span className="rounded-t-xl bg-gosi-blue px-2 py-1 text-xs text-white">{user.person.is_retiree ? "Monthly pension" : "Active contribution"}</span>
          <p className="mt-3 text-xl">•••• /Month</p>
          <p className="text-xs text-gosi-midnight-50">{user.person.is_retiree ? "Pension system: Private" : "Employer"}</p>
        </DemoButton>
      </div>
      <DemoButton className="w-full rounded-full border bg-white px-4 py-3 text-left text-gosi-rich-blue">› Find Anything with Just Your Voice!</DemoButton>
      <section>
        <h2 className="text-[22px] font-medium text-gosi-rich-blue">GOSI Services</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["Wage Certificate", "Pension Calculator", "Manage Contribution"].map((label) => (
            <DemoButton key={label} className="rounded-3xl bg-white p-3 text-center text-xs text-gosi-rich-blue">{label}</DemoButton>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-[22px] font-medium text-gosi-rich-blue">GOSI Opportunities</h2>
        {retireeCard && (
          <Link href={retireeCard.href(personaId)} className="block rounded-3xl bg-gosi-green-10 p-4 text-gosi-rich-blue">
            <p className="text-lg font-medium">{retireeCard.title}</p>
            <p className="text-sm">{retireeCard.body}</p>
            <span className="mt-3 inline-flex rounded-full bg-gosi-vivid-green px-4 py-2 text-sm">{retireeCard.cta}</span>
          </Link>
        )}
        <Link href={ageInRiyadh(user.person.birth_date, appNow) < 18 ? `/phone/${personaId}/opportunities` : `/phone/${personaId}/opportunities`} className="block rounded-3xl bg-gosi-rich-blue p-4 text-white">
          <p className="text-lg font-medium">{copy.seekerTitle}</p>
          <p className="text-sm text-white/80">{copy.seekerSubtitle}</p>
          <span className="mt-3 inline-flex rounded-full bg-gosi-vivid-green px-4 py-2 text-sm text-gosi-rich-blue">{copy.explore} ›</span>
        </Link>
      </section>
      <DemoButton className="w-full rounded-3xl bg-white p-4 text-left text-gosi-rich-blue">
        <p className="text-lg font-medium">Wafrah Program</p>
        <p className="text-sm">Current Path · Saving</p>
      </DemoButton>
      <Link href={`/phone/${personaId}/opportunities`} className="block rounded-3xl bg-gosi-rich-blue p-4 text-white">
        <p>Learn from experienced retirees</p>
        <span className="mt-2 inline-flex rounded-full bg-gosi-vivid-green px-3 py-1 text-sm text-gosi-rich-blue">Explore</span>
      </Link>
    </div>
  );
}

function retireeCopy(state: string, step: number, next: string | null) {
  if (state === "invited" || !state) return { title: copy.inviteTitle, body: "Share your experience with people who need it", cta: copy.startApplication, href: (id: string) => `/phone/${id}/opportunities/retiree` };
  if (state === "draft") return { title: "Continue your application", body: `${step} of 5 steps`, cta: "Continue", href: (id: string) => `/phone/${id}/opportunities/retiree/apply` };
  if (state === "pending_review") return { title: "Application under review", body: "We'll notify you in the app", cta: "View status", href: (id: string) => `/phone/${id}/opportunities/retiree/status` };
  if (state === "not_approved") return { title: "Action needed on your application", body: "Review the reason and resubmit", cta: "Review and resubmit", href: (id: string) => `/phone/${id}/opportunities/retiree/status` };
  if (state === "paused") return { title: "Your profile is paused", body: "Contact GOSI for details", cta: "Open", href: (id: string) => `/phone/${id}/opportunities/retiree` };
  return { title: "Your GOSI Opportunities", body: next ? formatWhen(next) : "No upcoming sessions", cta: "Open", href: (id: string) => `/phone/${id}/opportunities/retiree` };
}
