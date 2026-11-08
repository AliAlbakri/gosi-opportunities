# GOSI Opportunities demo

A working MVP 1 demo: retiree, seeker, ops, and tech journeys, with real data in Supabase and real video calls on Daily.co. Payment is a mock checkout that writes a real ledger.

## Setup

1. Create a free Supabase project (a region near Riyadh, such as Frankfurt) and a free Daily.co account.
2. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/migrations/0002_application_step.sql`.
3. Create a **private** Storage bucket named `retiree-docs`.
4. Enable the `pg_cron` and `pg_net` extensions. Do not schedule the tick until the app has a public URL.
5. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `DAILY_API_KEY` and `DAILY_DOMAIN` (for example `yourteam.daily.co`)
   - `CRON_SECRET` (any long random string)
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
   - `APP_TIMEZONE=Asia/Riyadh`
6. `npm install` then `npm run dev`. Open `/` and choose **Reset demo data**.

The UI uses Inter and IBM Plex Sans Arabic. If the dev machine cannot reach Google Fonts, Next falls back to the system font until the next successful download. Ping is not licensed for this demo.

## Jobs

The processor runs after every demo-clock change and, at most, every 15 seconds on a page load. After deploy, schedule it every minute in the Supabase SQL editor with `supabase/cron.sql` (replace the URL and `CRON_SECRET`). Vercel Hobby cron is daily, so the minute tick uses `pg_cron` and `pg_net`.

```sql
select cron.schedule(
  'opportunities-tick',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR-APP.vercel.app/api/jobs/tick',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{}'::jsonb
  );
  $$
);
```

## Deploy

Push the repo to GitHub, import it in Vercel, set the same environment variables, and set `NEXT_PUBLIC_APP_URL` to the Vercel URL. Then run the cron SQL above and use **Reset demo data** on the home page.
