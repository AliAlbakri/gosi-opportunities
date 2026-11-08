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

## Deploy on Vercel

The GitHub repo is [AliAlbakri/gosi-opportunities](https://github.com/AliAlbakri/gosi-opportunities). Import that repository in Vercel (Framework Preset: Next.js). Set these environment variables for Production before the first deploy. `NEXT_PUBLIC_*` values are baked in at build time, so change them and redeploy if the URL is wrong.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`), server only |
| `DAILY_API_KEY` | Daily.co API key |
| `DAILY_DOMAIN` | Daily subdomain, such as `yourteam.daily.co` |
| `CRON_SECRET` | Same long random string as local |
| `NEXT_PUBLIC_APP_URL` | The Vercel URL, such as `https://your-app.vercel.app` |
| `APP_TIMEZONE` | `Asia/Riyadh` |

After the deployment is live:

1. In the Supabase SQL editor, run `0001_init.sql` and `0002_application_step.sql` if the tables are not there yet. The private bucket `retiree-docs` should already exist.
2. Enable `pg_cron` and `pg_net`, then run `supabase/cron.sql` with the Vercel URL and `CRON_SECRET`.
3. Open the deployed site and choose **Reset demo data**.
