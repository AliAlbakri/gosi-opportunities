import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/phone/ui/header";
import { Avatar, Card, VerifiedBadge } from "@/components/phone/ui/bits";
import { StickyFooter } from "@/components/phone/ui/buttons";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { publicProfile } from "@/lib/domain/discovery";
import { requireUser } from "@/lib/domain/personas";
import { yearsOfEmployment } from "@/lib/domain/rules";
import { countLabel, formatSpan, money, relativeDay } from "@/lib/format";
import { serviceIcons } from "@/lib/phone-icons";
import { BrandIcon } from "@/components/phone/brand-icon";

export default async function ProfilePage({ params }: { params: Promise<{ personaId: string; retireeId: string }> }) {
  const { personaId, retireeId } = await params;
  const user = await requireUser(personaId);
  const profile = await publicProfile(retireeId);
  if (!user || !profile) notFound();
  const appNow = await getAppNow();
  const years = Math.round(yearsOfEmployment(profile.jobs, appNow));
  const next = profile.slots[0];
  const price = profile.services[0] && profile.paidEnabled && profile.services[0].pricing_mode === "paid" ? money(profile.services[0].price) : "Free";
  const bookHref = `/phone/${personaId}/opportunities/p/${retireeId}/book`;
  return (
    <div className="pb-28 text-gosi-rich-blue">
      <AppHeader title={profile.person.full_name} />
      <div className="space-y-6 px-5">
        <div className="flex items-center gap-4">
          <Avatar name={profile.person.full_name} size={96} />
          <div>
            <h1 className="text-[22px] font-semibold">{profile.person.full_name}</h1>
            <VerifiedBadge large />
            <p className="text-[15px]">{profile.profile.discipline_role} · {years} years of experience</p>
            <div className="mt-2 flex flex-wrap gap-2">{(profile.profile.languages ?? []).map((language) => <span key={language} className="rounded-full bg-gosi-midnight-10 px-3 py-1 text-[13px]">{language}</span>)}</div>
          </div>
        </div>
        <Card className="grid grid-cols-3 text-center">
          <div><p className="font-semibold">{profile.rating ? profile.rating.toFixed(1) : "New"}</p><p className="text-[13px] text-gosi-midnight-50">{profile.rating ? countLabel(profile.sessions, "review") : "No reviews yet"}</p></div>
          <div><p className="font-semibold">{profile.sessions}</p><p className="text-[13px] text-gosi-midnight-50">sessions</p></div>
          <div><p className="font-semibold">{years}</p><p className="text-[13px] text-gosi-midnight-50">years</p></div>
        </Card>
        <Link href={bookHref} className="block rounded-[20px] bg-gosi-green-10 p-4">
          <p className="font-semibold">{next ? `Next available: ${relativeDay(next, appNow)}` : "Fully booked for now"}</p>
          <p className="text-[13px] text-gosi-blue">See all times</p>
        </Link>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Services offered</h2>
          {profile.services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-center gap-2"><BrandIcon name={serviceIcons[service.service_type_id] ?? "development"} className="h-8 w-8" /><p className="font-semibold">{service.serviceType?.name}</p></div>
              <p className="mt-2 text-[13px]">{profile.paidEnabled && service.pricing_mode === "paid" ? money(service.price) : "Free"}</p>
              <p className="mt-2 line-clamp-3 text-[15px]">{service.description}</p>
              <Link className="mt-2 inline-block font-semibold text-gosi-blue" href={`${bookHref}?rst=${service.id}`}>Book this</Link>
            </Card>
          ))}
        </section>
        <Card>
          <div className="mb-3 flex items-center gap-2 rounded-2xl bg-gosi-rich-blue px-3 py-2 text-white"><BrandIcon name="security" tone="white" className="h-5 w-5" /> Verified by GOSI</div>
          <p>Status · Confirmed retiree</p>
          <p>Experience · {years} years</p>
          {profile.profile.show_employers && profile.jobs.filter((job) => job.employer && job.employer !== "Earlier employer").map((job) => (
            <p key={job.id} className="mt-2">{job.employer}{profile.profile.show_sector ? ` · ${job.sector}` : ""}{profile.profile.show_dates ? ` · ${formatSpan(job.start_date, job.end_date)}` : ""}</p>
          ))}
        </Card>
        <Card>
          <div className="mb-3 rounded-2xl bg-gosi-midnight-10 px-3 py-2 text-[13px] font-semibold">Self-declared, reviewed by GOSI</div>
          <p>Role · {profile.profile.discipline_role}</p>
          <p>Specializations · {profile.profile.specializations}</p>
          <p className="mt-2 text-[15px]">{profile.profile.intro}</p>
          <p className="mt-2 text-[13px]">{copy.docsProvided}</p>
        </Card>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {profile.reviews.map((review) => (
            <Card key={`${review.firstName}-${review.month}-${review.text.slice(0, 24)}`}>
              <p className="font-semibold">{review.firstName} · {review.month}</p>
              <p className="mt-1 text-[15px]">{review.text}</p>
            </Card>
          ))}
          {!profile.reviews.length && <p className="text-[15px] text-gosi-midnight-50">New on GOSI Opportunities</p>}
        </section>
        <p className="text-[13px] text-gosi-midnight-50">{copy.disclaimer}</p>
      </div>
      <StickyFooter>
        <div className="flex items-center gap-3">
          <div className="flex-1"><p className="font-semibold">{price}</p><p className="text-[13px] text-gosi-midnight-50">1-hour video session</p></div>
          {next ? <Link href={bookHref} className="inline-flex h-[52px] items-center rounded-full bg-gosi-vivid-green px-5 font-semibold text-gosi-rich-blue">Book a session</Link> : <span className="text-[13px] text-gosi-midnight-50">Fully booked for now</span>}
        </div>
      </StickyFooter>
    </div>
  );
}
