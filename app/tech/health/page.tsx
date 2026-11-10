import { HealthProbe } from "@/components/tech/health-probe";
import { getAppNow } from "@/lib/domain/clock";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";
import { formatLong } from "@/lib/format";
import { hasDaily } from "@/lib/daily";

export const dynamic = "force-dynamic";

function mask(value: string | undefined) {
  if (!value) return "missing";
  return `••••${value.slice(-4)}`;
}

export default async function HealthPage() {
  const supabase = hasSupabaseEnv() && (await databaseReady());
  const appNow = hasSupabaseEnv() ? await getAppNow() : null;
  const realNow = new Date();
  return (
    <main className="min-h-dvh bg-gosi-midnight-10 p-8 text-gosi-rich-blue">
      <h1 className="text-3xl">Tech health</h1>
      <ul className="mt-6 space-y-2 text-[15px]">
        <li>Supabase: {supabase ? "reachable" : "not reachable"}</li>
        <li>DAILY_API_KEY: {mask(process.env.DAILY_API_KEY)}</li>
        <li>DAILY_DOMAIN: {process.env.DAILY_DOMAIN || "missing"}</li>
        <li>Daily configured: {hasDaily() ? "yes" : "no"}</li>
        <li>App time: {appNow ? formatLong(appNow) : "unavailable"}</li>
        <li>Real time: {formatLong(realNow)}</li>
      </ul>
      <HealthProbe />
    </main>
  );
}
