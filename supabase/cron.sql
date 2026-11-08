-- Run AFTER deploying to Vercel (or with an ngrok URL for local testing).
-- Calls the job processor every minute. Replace the URL and secret.
select cron.schedule(
  'opportunities-tick',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://YOUR-APP.vercel.app/api/jobs/tick',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body    := '{}'::jsonb
  );
  $$
);
-- To remove: select cron.unschedule('opportunities-tick');
