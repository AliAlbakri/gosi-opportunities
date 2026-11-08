import { copy } from "@/lib/copy";

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DAILY_API_KEY",
  "DAILY_DOMAIN",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "APP_TIMEZONE=Asia/Riyadh",
];

export function SchemaScreen() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-8 text-gosi-rich-blue">
      <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="h-8" />
      <h1 className="text-2xl font-medium">Supabase is connected</h1>
      <p>The keys work and the private retiree-docs bucket is ready. The database tables are not created yet.</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Open the Supabase SQL editor for this project.</li>
        <li>Run supabase/migrations/0001_init.sql, then supabase/migrations/0002_application_step.sql.</li>
        <li>Come back here and refresh. Then choose Reset demo data.</li>
      </ol>
    </main>
  );
}

export function SetupScreen() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-8 text-gosi-rich-blue">
      <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="h-8" />
      <h1 className="text-2xl font-medium">{copy.setupTitle}</h1>
      <p>{copy.setupBody}</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>In Supabase, run supabase/migrations/0001_init.sql and 0002_application_step.sql.</li>
        <li>Create a private Storage bucket named retiree-docs.</li>
        <li>Enable the pg_cron and pg_net extensions. The minute tick waits until the app has a public URL.</li>
        <li>Copy .env.example to .env.local and fill the keys below. Restart npm run dev.</li>
      </ol>
      <ul className="rounded-2xl bg-gosi-midnight-10 p-4 font-mono text-xs">
        {keys.map((key) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
    </main>
  );
}
