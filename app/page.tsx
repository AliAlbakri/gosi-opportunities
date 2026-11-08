import { DemoControls } from "@/components/demo/controls";
import { Launcher } from "@/components/demo/launcher";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { copy } from "@/lib/copy";
import { getAppNow } from "@/lib/domain/clock";
import { nextBookingLabel } from "@/lib/domain/demo-clock";
import { processDueLazy } from "@/lib/domain/jobs";
import { listPersonas } from "@/lib/domain/personas";
import { getSettings } from "@/lib/domain/settings";
import { formatLong } from "@/lib/format";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  await processDueLazy();
  const [personas, settings, appNow, next] = await Promise.all([
    listPersonas(),
    getSettings(),
    getAppNow(),
    nextBookingLabel(),
  ]);
  const users = personas.filter((row) => row.kind === "gosi_user");
  const retirees = users.filter((row) => row.id.startsWith("ret-"));
  const seekers = users.filter((row) => row.id.startsWith("seek-"));
  return (
    <main className="min-h-dvh bg-gosi-midnight-10 p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="h-8" />
          <div>
            <h1 className="text-xl font-medium text-gosi-rich-blue">{copy.demoTitle}</h1>
            <p className="text-sm text-gosi-midnight-50">{formatLong(appNow)}</p>
          </div>
        </div>
        <span className="rounded-full bg-gosi-amber-bg px-3 py-1 text-sm text-gosi-amber-text">
          {settings.paid_enabled ? copy.paidOn : copy.paidOff}
        </span>
      </header>
      <Launcher retirees={retirees} seekers={seekers} operators={personas.filter((row) => row.kind === "operator")} />
      <DemoControls
        appNow={appNow.toISOString()}
        realNow={new Date().toISOString()}
        nextLabel={next ? `${next.seeker} with ${next.retiree}` : null}
      />
    </main>
  );
}
