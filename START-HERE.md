# GOSI Opportunities: Cursor build pack

Everything Cursor needs to build a fully working MVP 1 demo of GOSI Opportunities: Next.js + Supabase + Daily.co video, deployed on Vercel. Only payment is mocked.

## What's in here
| Path | What it is |
|---|---|
| `.cursor/rules/` | Always-on context for Cursor: project, brand/UI, stack, business rules |
| `docs/PRD.md` | PRD V4 as markdown (product source of truth) |
| `docs/DEMO-SPEC.md` | How the demo implements the PRD: routes, screens, personas, demo clock, jobs, notifications, seed data, demo script |
| `docs/BUILD-PLAN.md` | 8 phases, each with a prompt to paste into Cursor and acceptance checks |
| `supabase/migrations/0001_init.sql` | Full database schema + taxonomy (tested on Postgres 16) |
| `supabase/cron.sql` | Minute job tick, run after deploying |
| `brand/gosi-brand/` | GOSI brand skill, tokens, logos, arrows, icons, patterns, illustrations |
| `reference/super-app/` | Screenshots of the real GOSI app to mimic |
| `reference/prd/` | PRD V4 PDF |
| `.env.example` | Environment variables to fill |

## How to use it
1. Follow **Phase 0** in `docs/BUILD-PLAN.md` (accounts, create the Next.js app, copy this pack in, run the SQL, fill `.env.local`).
2. Open the folder in Cursor. In Cursor settings, check the rules in `.cursor/rules` are picked up.
3. For each phase 1–8: open a new Agent chat, paste that phase's prompt, let it build, run the acceptance check, commit.
4. Deploy (Phase 8) and run the demo script on the demo home.

## Free tiers used
Supabase Free, Vercel Hobby, Daily.co Free (10,000 participant minutes a month). No paid services.

## Decisions baked in
- English only; persona picker styled as Nafath instead of real login; personas live in the URL so several can be open side by side.
- Demo clock that admins can fast-forward; every rule runs on app time.
- Real video via Daily.co; mock PSP checkout with a real ledger (held, released, paid out, refunded).
- Tech config page for the paid switch and price band, separate from the ops console.
- Retiree entry card shown only to invited retirees; the seeker card is shown to every user aged 18+.
