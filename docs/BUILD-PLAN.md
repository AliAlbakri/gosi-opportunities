# Build plan: phases and Cursor prompts

Work through the phases in order. For each one, start a **new Cursor Agent chat**, paste the prompt, and don't move on until the acceptance checks pass. Commit after each phase.

Every prompt assumes Cursor has read `.cursor/rules/*`. If it drifts, say: *"Re-read docs/DEMO-SPEC.md §X and the rules, then fix."*

---

## Phase 0: Setup (you, ~20 min)
1. Create accounts (all free): Supabase, Vercel, Daily.co, GitHub.
2. Create the app in a new empty folder: `npx create-next-app@latest gosi-opportunities --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*"`, then copy **everything from this pack** into `gosi-opportunities/` (including the hidden `.cursor` folder and `.env.example`).
3. `cd gosi-opportunities`, `npx shadcn@latest init` then install: `npm i @supabase/supabase-js @daily-co/daily-js date-fns date-fns-tz zod lucide-react`.
4. Supabase: new project (region closest to Riyadh, e.g. Frankfurt or Mumbai) → SQL editor → run `supabase/migrations/0001_init.sql`. Storage → create **private** bucket `retiree-docs`. Database → Extensions → enable `pg_cron` and `pg_net`.
5. Daily.co: Developers → API key.
6. Copy `.env.example` to `.env.local` and fill it. After deploying (Phase 8), run `supabase/cron.sql` with your Vercel URL so the job tick runs every minute.
7. Open the folder in Cursor.

---

## Phase 1: Foundations
```
Read .cursor/rules/*, docs/DEMO-SPEC.md §1, §2, §3, §9 and brand/gosi-brand/SKILL.md.
Build the foundations:
1. Theme: copy brand tokens into globals.css and tailwind config, copy brand assets to public/brand, load Inter + IBM Plex Sans Arabic, theme shadcn per 10-brand-ui rules.
2. lib/supabase/admin.ts, lib/domain/clock.ts (getAppNow), lib/domain/audit.ts, lib/domain/notifications.ts, lib/realtime.ts (server broadcast + client usePersonaChannel hook + global 'demo' channel).
3. Demo home "/" with the three columns (two phone iframes with persona dropdowns, shortcuts), header with app clock and paid switch pill.
4. Floating Demo controls panel with all clock buttons; after each change call processDue() (stub for now) and broadcast clock.changed.
5. Phone shell: iPhone frame (status bar shows app time), splash A → splash B → welcome → mock Nafath persona picker → /phone/[personaId]/home. Home screen mimicking reference/super-app screenshots exactly (visual-only parts show a "Not part of this demo" toast). Bottom tab bar. Notifications bell + inbox + live iOS banner.
6. Minimal scripts/seed.ts: settings, operators, 3 retiree personas, 2 seeker personas with GOSI records, and a "Reset demo data" button on the demo home that runs it server-side.
7. /ops/[operatorId] layout with sidebar (empty pages) and /tech placeholder.
Acceptance: I can open two phones side by side, log in as different personas via mock Nafath, see the home screen in GOSI style, fast-forward the clock and see the status bar time change in both phones live, and a test notification (add a temporary button) appears as a banner in the right phone only.
```

## Phase 2: Invitations and application
```
Read docs/PRD.md Stage 1–4 and docs/DEMO-SPEC.md §3.4, §4.1, §8.2, §10.
Build:
1. Ops › Invitations: new wave (filters, live candidate count, sector breakdown, size cap, confirm and send), manual invite by National ID, waves table with the funnel.
2. Phone: GOSI Opportunities section on home with the seeker card for everyone and the retiree card for invited retirees (all state variants). Opening sets invitations.opened_at.
3. Retiree 5-step application wizard with autosave as Draft, document upload to Storage, Category → Service Type selection with descriptions, review + T&C + submit.
4. Notifications for invite and submit (retiree + operators). Audit entries.
Acceptance: Ops sends a wave → the invited retiree's phone shows a banner and the retiree card; an uninvited retiree sees only the seeker card; the retiree can leave mid-wizard, come back to the same step, upload a CV, submit; the operator gets a notification.
```

## Phase 3: Review and go-live
```
Read PRD Stage 5–6 and DEMO-SPEC §4.2–4.4, §8.3.
Build:
1. Ops › Review queue and review detail (Layer 1 + Layer 2 + signed document links), per-Service-Type approve / not approve with reason codes and note; profile state rules.
2. Phone: retiree status screen with per-Service-Type chips and reasons; amend and resubmit; add a Service Type later.
3. Go-live checklist: onboarding video (placeholder), readiness test call (solo Daily room via lib/daily.ts), weekly availability editor. "You're live" notification.
4. Retiree home tabs: Sessions (empty for now), Availability (+ self-pause toggle), Profile (seeker view preview + edit).
Acceptance: approve one Service Type and not-approve another → retiree sees both and the reason; resubmit sends it back to the queue; after the checklist the retiree is "live".
```

## Phase 4: Discovery and booking
```
Read PRD Stage 7 and DEMO-SPEC §5.1–5.4.
Build seeker browse (categories, Service Types, search, language filter), retiree profile with the Verified by GOSI / Self-declared split and disclaimer, slot picker (24h–30d, 1h, no overlaps, Asia/Riyadh), booking form (need + goal required), T&C, immediate confirmation, My bookings (seeker) and Sessions list (retiree). Under-18 block. Notifications. Expand scripts/seed.ts to the full seed in DEMO-SPEC §11 (free parts) so browse feels full.
Acceptance: Sara books Fahad 2 days out; both phones get banners; the slot disappears for other seekers; a 16-year-old can't book; fully booked retirees show their next slot.
```

## Phase 5: Sessions, cancellations, no-shows, feedback
```
Read PRD Stage 8–9 and DEMO-SPEC §5.5, §6, §9.
Build:
1. Daily rooms on confirm, meeting tokens on join, in-phone call screen (Daily Prebuilt in the phone viewport), join window, session_events logging, 60-minute banner, completion rule.
2. Cancellation by either party with the 3h late rule and notifications.
3. Full processDue(): holds expiry, 24h/1h reminders, no-shows at +15 min, completion, stragglers. /api/jobs/tick with CRON_SECRET; README snippet for pg_cron + pg_net scheduling every minute; lazy trigger on page loads (throttled 15s).
4. Feedback form after the call, written review moderation in Ops, aggregate rating on profiles (retiree sees aggregate only).
5. Report a problem → complaint; Ops › Reports and disputes (complaints tab).
Acceptance: with the demo clock jumped to the session start, both personas join the real video call from two tabs, share a screen, leave; feedback works; a session where the retiree doesn't join becomes a retiree no-show after +15 min; a late cancel shows in ops.
```

## Phase 6: Ops monitoring
```
Read PRD Stage 10 and DEMO-SPEC §8.4, §8.6, §8.8.
Build the Retirees monitoring list with every PRD column, retiree detail with history, Send a note (templates), Pause (reason, cancel bookings, notify seekers) and Restore, Overview page, Audit log page.
Acceptance: pausing a retiree with upcoming bookings cancels them and notifies the seekers; restore brings them back; every action is in the audit log with app time.
```

## Phase 7: Paid sessions
```
Read PRD "Paid Sessions" and DEMO-SPEC §7, §5.6, §8.5, §8.7 and 30-business-rules.
Build:
1. /tech config page: switch (with impact dialog on off), floor, ceiling, suggested price per Category, band clamping.
2. Retiree pricing per Service Type (free/paid, slider within band, suggested marker). Prices and paid filters in browse; price on profile, slot and summary.
3. Mock PSP checkout sheet (mada / Apple Pay / card, 10-min countdown, Simulate success/failure), payments ledger, pending_payment holds.
4. Refunds in every non-delivery case; release at +48h; disputes within 48h (freeze release, ops evidence panel with join/leave timeline, refund in full or reject, 10 working days due date, overdue badge).
5. Retiree Earnings tab (Held / Released / Paid out definitions + list), monthly settlement (auto on month change + Ops › Settlement page + CSV).
6. Switch-off procedure. Paid-only columns in the ops monitoring list.
7. Seed the paid history from DEMO-SPEC §11.
Acceptance: run DEMO-SPEC §12 steps 8–13 end to end.
```

## Phase 8: Polish and deploy
```
Read DEMO-SPEC §11–12. Complete the full seed (every persona state, history, paid history, open dispute). Put the demo script checklist on the demo home. Check every screen against .cursor/rules/10-brand-ui.mdc and the reference screenshots; fix spacing, empty and loading states, and copy (no "provider", no "manually"). Make sure the phone works full-screen on a real phone. Then deploy: push to GitHub, import in Vercel, add env vars, set NEXT_PUBLIC_APP_URL, point pg_cron at the Vercel URL, run Reset demo data.
Acceptance: run the full DEMO-SPEC §12 script on the Vercel URL without errors.
```

---

## If Cursor gets stuck
- "Run the dev server, open <route>, read the console and fix the error."
- "Check this against docs/DEMO-SPEC.md §X and list what's missing before coding."
- "The slot math is off: all slot math must use Asia/Riyadh and getAppNow(). Add unit tests for lib/domain/availability.ts."
