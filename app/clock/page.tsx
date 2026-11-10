import Link from "next/link";
import { DemoControls } from "@/components/demo/controls";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { nextBookingLabel } from "@/lib/domain/demo-clock";
import { processDueLazy } from "@/lib/domain/jobs";
import { formatWhen } from "@/lib/format";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ClockPage() {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  await processDueLazy();
  const [appNow, next] = await Promise.all([getAppNow(), nextBookingLabel()]);
  return (
    <main className="min-h-dvh bg-gosi-midnight-10 p-6 text-gosi-rich-blue">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="h-8" />
          <h1 className="text-xl font-medium">{copy.clockTitle}</h1>
        </div>
        <Link className="text-sm text-gosi-blue" href="/">{copy.clockHome}</Link>
      </header>
      <p className="mb-6 max-w-xl text-sm text-gosi-midnight-80">{copy.clockBody}</p>
      <DemoControls
        appNow={appNow.toISOString()}
        realNow={new Date().toISOString()}
        next={next ? {
          label: `${next.seeker} with ${next.retiree} · ${formatWhen(next.startsAt)}`,
          when: formatWhen(next.startsAt),
          seeker: next.seeker,
          retiree: next.retiree,
          seekerHref: `/phone/${next.seekerSlug}/opportunities/bookings/${next.id}`,
          retireeHref: `/phone/${next.retireeSlug}/opportunities/bookings/${next.id}`,
        } : null}
      />
    </main>
  );
}
