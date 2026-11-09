# GOSI Opportunities: demo build spec

This file turns `PRD.md` into a working, end-to-end demo. Read the PRD for *what* the product does and why. Read this file for *how the demo is built*. Where they disagree, this file wins for the demo.

**Goal:** every journey in the PRD works for real, with real data written to Supabase, in a demo you can run live in one meeting. **Only payment is mocked** (a fake PSP that writes a real ledger). Login is mocked (persona picker styled as Nafath). Everything else is functional: invitations, applications, uploads, review, availability, booking, real video calls, cancellations, no-shows, feedback, moderation, monitoring, pausing, paid sessions, disputes, release and monthly settlement.

**Language:** English only, LTR. (Keep strings in one `lib/copy.ts` so Arabic can be added later. Arabic Category and Service Type names are shown as secondary labels where the PRD shows them.)

---

## 1. Surfaces and routes

| Surface | Route | Width | Who |
|---|---|---|---|
| Demo home (launcher) | `/` | Desktop | Presenter |
| Phone: GOSI super-app | `/phone/[personaId]/...` | 390 × 844 iPhone frame, centred | Any GOSI user persona (retiree and/or seeker) |
| Ops console | `/ops/[operatorId]/...` | Desktop, sidebar layout | Operator personas (business owner team) |
| Tech config | `/tech` | Desktop, single page | Tech team (not in ops console) |
| Demo controls | floating panel on `/`, `/ops/*`, `/tech` | — | Presenter |

**Persona lives in the URL, not a cookie**, so several personas can be open side by side in one browser (tabs or iframes). There is no real auth. All DB access is server-side with the service role key.

### 1.1 Demo home `/`
- Header: GOSI wordmark, "GOSI Opportunities · MVP 1 demo", demo clock readout (app time, e.g. "Sun 9 Nov 2026, 10:00"), and the paid switch state as a read-only pill ("Paid sessions: Off").
- Three columns:
  1. **Retiree phone**: persona dropdown (retiree personas) + embedded iframe of `/phone/[id]`.
  2. **Seeker phone**: persona dropdown (seeker personas) + embedded iframe.
  3. **Shortcuts**: open Ops console (operator dropdown), open Tech config, open each phone in a new tab, "Reset demo data" (re-runs seed, confirm dialog), short demo script checklist (section 12).
- Iframes and tabs update live (Realtime broadcast), so an action in one view shows in the others without refresh.

### 1.2 Demo controls (floating panel, bottom-right)
- App time and real time.
- Buttons: **+1 hour**, **+3 hours**, **+1 day**, **+48 hours**, **Jump to next booking start** (sets clock to 5 min before the next confirmed booking), **Jump to month end** (sets clock to 23:55 on the last day of the current app month), **Reset clock to real time**.
- After any clock change: run the job processor (section 9) immediately, then broadcast `clock.changed` to all clients.
- The clock never moves backwards past already-processed events except via "Reset demo data".

---

## 2. Personas and mock identity

### 2.1 Mock Nafath (inside the phone)
Phone flow on first open of `/phone` (no persona): Splash → Welcome → **Login** → mock Nafath screen → persona list → home.
- Nafath screen: white, "Nafath" style header (use neutral styling, do **not** reproduce the real Nafath logo), text "Choose an identity to continue (demo)". List of GOSI user personas with name, ID masked (`1•••••4821`), and a one-line blurb (e.g. "Retired English teacher · invited · application in draft"). Tapping one routes to `/phone/[id]/home`.
- "Log out" in the phone's More tab returns to Welcome.

### 2.2 Persona rules
- A GOSI user persona is any `gosi_people` row with a `personas` entry. Age comes from `birth_date`.
- **Seeker** = any GOSI user aged 18+ (by app time). Under-18 users see the Opportunities card but get an "Available for users aged 18 and over" screen and cannot book.
- **Retiree side** is available only if `gosi_people.is_retiree` and an `invitations` row exists.
- A retiree can also browse and book as a seeker, but never book themselves.
- Operators (`kind = operator`) log into `/ops/[id]`. The Tech persona (`kind = tech`) is implied by `/tech` (no picker needed).

---

## 3. The phone: GOSI super-app shell

Mimic the real GOSI app from the screenshots in `reference/super-app/`. Only the GOSI Opportunities parts are functional; everything else is visual, and tapping it shows a toast "Not part of this demo".

### 3.1 iPhone frame
- 390 × 844 viewport inside a rounded device bezel (black, ~44px radius) with a Dynamic Island and a status bar (time = **app time** HH:MM, signal, battery). Home indicator bar at the bottom.
- On screens < 500px wide (opened directly on a phone), drop the bezel and render full-screen.

### 3.2 Splash and welcome (see `01`–`03` screenshots)
1. Splash A: Rich Blue `#00004E` full screen, white `gosi›` wordmark centred (0.8s).
2. Splash B: primary reversed logo (wordmark + التأمينات الاجتماعية + Social Insurance) centred (0.8s).
3. Welcome: Rich Blue background with a large tone-on-tone arrow shape (Rich Blue 80 `#333371`) behind; top bar with `gosi›` wordmark, pill "Quick Services", circular buttons (ع, headset, accessibility); a video card placeholder (rounded, green border); "Welcome back" + persona first name in caps if a persona was used before, otherwise "Welcome"; **Login** (Vivid Green pill, Rich Blue label) and **My Certificates** (white pill outline); footer "By login to GOSI App, you agree on Privacy policy and Taqdeer Program" (links in green, non-functional).

### 3.3 Home (see `04`–`06` screenshots)
Background Midnight 10% `#E6E7EA`. Top: avatar circle (Midnight), "Good morning/afternoon/evening," (by app time) + first name in caps, round white buttons: bell (with unread dot, **functional**, opens notification inbox), search, ع, mic.
Sections in order:
1. Announcement carousel (lavender card, purple border, e.g. work anniversary). Visual only.
2. Row: story thumbnail card + **status card**: for retirees "Monthly pension" (blue tab, masked amount with eye toggle, "Pension system: Private", "Retired since: 2019"); for non-retirees "Active contribution" (as screenshot). Visual only.
3. Voice search bar "› Find Anything with Just Your Voice!". Visual only.
4. "GOSI Services" grid of three (Wage Certificate, Pension Calculator, Manage Contribution) with green line icons. Visual only.
5. **GOSI Opportunities section (functional, new)**. Section title "GOSI Opportunities" with "View All ›" link. Content depends on persona (section 3.4).
6. "Wafrah Program" card (Current Path · Saving · progress bar). Visual only.
7. "You Might Be Interested" horizontal carousel of Rich Blue promo cards (Start now buttons). **Add one GOSI Opportunities promo card** here too ("Learn from experienced retirees" / "Explore"), functional, opens the seeker browse.
Bottom tab bar: Home, Contributions, Help, Benefits, More (green dot under active). Only Home and More (Log out, Notifications) are functional.

### 3.4 The GOSI Opportunities entry card(s)
UX-OVERHAUL §3.2 replaces the earlier two-card layout. An uninvited retiree still sees no entry.

| Persona | What appears on home |
|---|---|
| Retiree, invited | One Rich Blue hero in a "GOSI Opportunities" section after GOSI Services. No seeker card. |
| Retiree, not invited | No section. |
| Non-retiree, 18+ | One seeker hero in that section, plus one promo in "You Might Be Interested". |
| Under 18 | The same seeker card. Tapping it opens the age screen. |

Hero copy for an invited retiree: Learn more (no profile), Continue (draft), View status (pending review), Review and resubmit (not approved), Finish setup (go-live incomplete), Open (active), View details (paused). First open of an invitation still sets `opened_at`.

### 3.5 Notifications
- Inbox: bell → list (newest first, unread bold, time relative to app time) → tap opens `link`.
- **Live banner:** when a notification is created for the persona currently shown in a phone, an iOS-style banner slides down from the top of the phone frame (white, rounded 20px, small gosi app icon, "GOSI · now", title, body), auto-hides after 5s, tap opens the link. Delivered via Supabase Realtime Broadcast on channel `persona:{personaId}`.
- Every notification in section 10 must be implemented.

---

## 4. Retiree journey (phone)

Routes under `/phone/[id]/opportunities/retiree/...`. Header: back chevron, title, small "GOSI Opportunities" label.

### 4.1 Application (stages 1–4)
A 5-step wizard with a step indicator, autosaved as **Draft** (`retiree_profiles.state = draft`) after every field change. Leaving and returning resumes at the last step.
1. **Your GOSI record** (Layer 1, read-only): name, confirmed retiree status, pension system, years of experience (sum of employment), year last active, list of employers with dates and sector. Toggles: "Show employers", "Show dates", "Show sector" on my public profile. Badge "Verified by GOSI".
2. **Your professional background** (Layer 2, self-declared): Professional discipline and role (text, required), Specializations (multi-line, optional), Personal introduction (multi-line, optional), Languages offered (multi-select chips, fixed list: Arabic, English, French, Urdu, Hindi, Filipino, Bengali, Indonesian, Turkish, Spanish, at least one required). Label "Self-declared, reviewed by GOSI before publishing".
3. **Documents**: upload certificates (multiple) and CV (one), PDF/JPG/PNG up to 10 MB, Supabase Storage bucket `retiree-docs` (private, server signed URLs for viewing). Optional.
4. **What you'll offer**: pick a Category, then one or more Service Types (fixed list from DB; no free text names). For each selected Service Type: required description (min 80 chars, max 800) with the PRD example as placeholder. Can add Service Types from both Categories.
5. **Review and submit**: summary of everything, T&C sheet ("I agree to the GOSI Opportunities terms and conditions", scrollable placeholder T&C text; checkbox required), **Submit for review**.

On submit: `state = pending_review`, every RST `status = pending`, `terms_accepted_at`, `submitted_at`, audit log, notifications (retiree: "Application submitted"; all operators: "New application to review").

### 4.2 Review outcome (stage 5)
- Retiree status screen lists each Service Type with its status chip: Pending (Midnight 10% chip), Approved (green), Not approved (with the reason text from reason code + operator note).
- **Amend and resubmit:** for not-approved items the retiree can edit the description (and profile/doc fields), then **Resubmit** → those items go back to `pending`, profile back to `pending_review` if no item is approved yet, otherwise stays `active` with the item pending.
- Profile state rules:
  - Any RST approved → profile `active` (first time: set `first_approved_at`).
  - None approved, at least one `not_approved`, none pending → `not_approved`.
  - Otherwise pending → `pending_review`.
- The retiree can add a new Service Type later; it goes to `pending` while existing approved listings stay live (PRD "Adding later").

### 4.3 Going live (stage 6)
After the first approval, the retiree home shows a **Go-live checklist**. Listings are visible to seekers only when all three are done:
1. **Watch the onboarding video** (in-app player with a placeholder MP4 or a styled placeholder + "Mark as watched"). Sets `onboarding_watched_at`.
2. **Readiness test call**: opens a solo Daily room (`test-{personaId}`) with camera/mic preview; buttons "I can see and hear myself" (sets `readiness_passed_at`) or "Something's not working" (shows tips).
3. **Set your availability**: weekly windows per weekday (add multiple ranges, whole hours, between 06:00 and 23:00). Slots are 1 hour on the hour, generated on the fly for the next 30 days.
Then a "You're live" confirmation and notification.

### 4.4 Retiree home (active)
Tabs: **Sessions** | **Availability** | **Profile** | **Earnings** (Earnings only when the paid switch is on).
- Sessions: upcoming (date, time, seeker first name, Service Type, seeker's need and goal, Paid/Free chip, Join button active from 10 min before start, Cancel), past (status: Completed, Cancelled by…, No-show…), aggregate rating ("4.6 ★ from 12 sessions" or "New, no ratings yet"). **No individual ratings, reviews, or rater identities are shown.**
- Availability: edit windows; **Pause new bookings** toggle (self-service; confirmed bookings stay; `accepting_bookings=false`; hidden from browse).
- Profile: view as seekers see it; edit Layer 2 (edits to approved text keep the listing live; re-moderation is not required in the demo, log an audit entry); manage Service Types (add new → pending); per Service Type **Free or paid** (paid switch on only, section 7).
- Notes from GOSI: list of ops notes received.

---

## 5. Seeker journey (phone)

Routes under `/phone/[id]/opportunities/...`.

### 5.1 Browse (stage 7)
- Top: search field (matches retiree name, discipline, Service Type, description), filter chips: Language, Free only / Paid only (paid switch on only).
- Category cards (Education and Training, Accounting and Finance, with Arabic names as secondary) → Service Type list → retiree list.
- Retiree card: avatar initials circle, name, discipline, "Verified by GOSI" mini badge, years of experience, languages, rating ("4.6 ★ · 12 sessions") or "New on GOSI Opportunities", price chip ("Free" or "SAR 150"), **next available slot** ("Next: Tue 11 Nov, 18:00"). Retirees with no free slot in the 30-day window stay listed with "Fully booked for now" (PRD: stay visible so seekers see supply exists). Retirees with `accepting_bookings=false`, `paused`, or an incomplete go-live checklist are not listed.
- Under-18: blocked screen.

### 5.2 Retiree profile
Two clearly separated blocks:
- **Verified by GOSI** (Rich Blue header with check icon): name, confirmed retiree, years of professional experience, year last active, and only the employers/dates/sector the retiree chose to show.
- **Self-declared by the retiree** (grey header): discipline and role, specializations, languages, introduction, certificates/CV listed as "Documents provided (reviewed by GOSI)" (names only, not downloadable by seekers).
- Ratings: aggregate + approved written reviews (first name of reviewer + month).
- Approved Service Types offered, each with description and price.
- Disclaimer (always): "Sessions are guidance based on professional experience, not a licensed professional service."

### 5.3 Booking
1. Choose Service Type → calendar strip (next 30 days) → available 1-hour slots. Only slots ≥ 24h from app now and ≤ 30 days ahead; not overlapping any `pending_payment`/`confirmed` booking of that retiree; the seeker also cannot double-book themselves.
2. Form (both required): "What do you need help with?" and "What do you want out of the session?".
3. Summary: retiree, Service Type, date/time, duration 1 hour, price (Free or SAR X), disclaimer, T&C checkbox (with payment, refund and dispute terms if paid).
4. Free → **Confirm booking** → `confirmed` immediately (no retiree acceptance).
   Paid → **Continue to payment** → booking `pending_payment` with `hold_expires_at = now + 10 min` → mock PSP sheet (section 7.3).
5. Confirmation screen + notifications (section 10). Booking appears in **My bookings**.

### 5.4 My bookings
Upcoming / Past. Upcoming card: retiree, date/time, Service Type, Free/Paid, **Join** (active from 10 min before), **Cancel**. Past: status, **Rate session** (if completed and not yet rated), **Report a problem**, **Book again**.

### 5.5 Feedback (stage 9)
After a completed session, the seeker gets a prompt (screen shown right after leaving the call, plus a notification). Fields: rating 1–5 (required), "Did this session help with what you needed?" Yes/No, tags (multi: clear explanation, strong knowledge, well prepared, unclear, limited knowledge, unprepared, off-topic, unprofessional), optional written review (`review_status = pending` → ops moderation before it shows on the profile).

### 5.6 Report a problem / dispute
From a past booking or the session-end screen. Reason list (radio) + description (required).
- Free session, or paid session more than 48h after `completed_at`: creates a `complaint`.
- Paid session within 48h of `completed_at`: creates a `dispute` (one per booking), freezes payment release, `due_by = created + 10 working days (Sun–Thu)`, notifies retiree ("A payment is under review") and operators.
- Dispute reasons: Retiree didn't attend · Session ended early · Not the Service Type booked · Unprofessional conduct · Technical problem · Other. Complaint reasons: same list.

---

## 6. Sessions and cancellation (stage 8)

### 6.1 Video (Daily.co)
- On booking confirm, create a private Daily room via REST (`name = opp-{bookingId8}`, `privacy: private`, `exp = ends_at + 3h`, `enable_screenshare: true`, chat off, recording off). Create a meeting token per participant on Join (`user_name`, `exp`).
- Join opens an in-phone call screen embedding Daily Prebuilt (call frame) inside the phone viewport, with a top bar: Service Type, a session timer counting from scheduled start, and "Scheduled time: 1 hour".
- Screen sharing on; no file transfer/chat.
- Log `session_events` on `joined-meeting` and `left-meeting` client events (POST to `/api/sessions/[bookingId]/event`, server stamps `app_now()`).
- **At 60 minutes** (scheduled end, app time): in-call banner to both: "Scheduled time has ended. You can continue." If the retiree has another booking starting at that time, add "Your next session starts now" for the retiree.
- Leaving never ends the call for the other party. **Session completes** when the scheduled end has passed and both parties have left (`completed_at = time of last left`).
- Join is allowed from 10 min before start until scheduled end + 30 min.

### 6.2 No-shows (15-minute rule)
At `starts_at + 15 min` (app time), for confirmed bookings:
- Retiree has no `joined` event → `no_show_retiree` (recorded as missed session; refund if paid; notify both).
- Else seeker has no `joined` event → `no_show_seeker` (recorded against seeker; **refund in full if paid**; notify both).

### 6.3 Cancellation
Either party, up to the session start (Cancel button disappears at start).
- ≥ 3h before start: no record. < 3h: `late_cancel = true` (recorded against the cancelling party).
- Paid: **always full refund** to the seeker, whoever cancels and whenever.
- Notify the other party (seeker gets "Book another slot" link when the retiree cancels).
- Ops pause of a retiree cancels all their future confirmed bookings (`cancelled_by = gosi`), refunds paid ones, and notifies seekers with a rebook prompt.
- No rescheduling: cancel and rebook.

---

## 7. Paid sessions

### 7.1 Tech config `/tech` (tech team only, not in the ops console)
Page title "Tech configuration: paid sessions". A note: "Managed by the tech team. Not available in the ops console."
- **Paid sessions switch** (big toggle). Turning **on**: confirm dialog. Turning **off**: confirm dialog listing the impact (N confirmed paid bookings will be cancelled and refunded); on confirm run the switch-off procedure (7.6).
- **Price floor** and **Price ceiling** (SAR, floor < ceiling).
- **Suggested price per Category** (must be within band).
- Save → audit log + broadcast `settings.changed`. If the band changes, clamp any retiree price outside it to the nearest limit (new bookings only) and notify each affected retiree.

### 7.2 Retiree pricing
When paid is on, each approved Service Type has "Free / Paid" segmented control. Paid → price input with slider between floor and ceiling, the Category's suggested price shown as a marker and helper text ("Suggested for this Category: SAR 180"). Changes apply to new bookings only. When paid is off, all of this is hidden and every listing shows as Free.

### 7.3 Mock PSP checkout (the only mocked integration)
Bottom sheet styled as a neutral payment provider ("Secure payment · GOSI Opportunities", merchant `GOSI-OPP-001`), amount in SAR, 10-minute countdown (from `hold_expires_at`), methods: **mada**, **Apple Pay**, **Credit card** (card number/expiry/CVV fields, pre-filled test card). Two demo buttons under the pay button: **Simulate success** (default action of Pay) and **Simulate failure**.
- Success → `payments.status = held`, `held_at`, fake `psp_ref`, booking `confirmed`, Daily room created.
- Failure → booking `expired`, `payments.status = failed` row kept for the ledger, slot freed, error screen "Payment didn't go through. You haven't been charged."
- Countdown reaching 0 or closing the sheet → booking `expired`, slot freed.

### 7.4 Money states (PRD "Payment states")
- **Held**: paid, not yet the retiree's. Can still be refunded.
- **Released**: `completed_at + 48h` passed with no dispute, or dispute rejected. Belongs to the retiree; no longer refundable.
- **Paid out**: included in a monthly settlement to the pension bank account. Final.
- **Refunded**: any non-delivery case (all cancellations, both no-shows, ops pause, switch-off) or an upheld dispute.

### 7.5 Monthly settlement
Runs automatically when app time crosses into a new month (for the previous month), and manually from Ops › Settlement ("Run settlement for <month>"). For each retiree: sum all `released` payments not yet paid out → one `payouts` row (bank + masked IBAN from `gosi_people`), set payments `paid_out`, notify retiree ("SAR X from GOSI Opportunities was sent to your pension bank account. It's a separate transfer, not part of your pension."). Settlement file view: table per retiree, total, CSV download.

### 7.6 Switching paid off
Cancel every future `confirmed` and `pending_payment` paid booking (`cancelled_by = system`), refund in full, notify both parties. Released amounts still go in the next settlement. Open disputes and held amounts for already-completed sessions continue normally. All RSTs set to `pricing_mode = free` (prices cleared). If switched on again, retirees set prices again.

### 7.7 Retiree earnings tab
Totals for Held, Released, Paid out (with a one-line definition each from the PRD), then a list of paid sessions with amount and state, and past payouts.

---

## 8. Ops console `/ops/[operatorId]`

Desktop layout: left sidebar (GOSI wordmark, operator name), white content area, Rich Blue table headers like the PRD tables. Sidebar items: Overview, Invitations, Review queue, Retirees, Reports and disputes, Review moderation, Settlement, Audit log.

1. **Overview**: counts (invited, drafts, pending review, active, paused, upcoming sessions, open disputes with overdue count), and the latest audit entries.
2. **Invitations**
   - **New wave**: filters over `gosi_people` where `is_retiree`: pension system (multi), sector (multi, from employment), min years of contribution, region (multi). Shows live candidate count and a breakdown by sector; candidates already invited are excluded automatically. Set wave name and **size cap** (manual number). **Confirm and send** → creates invitations (up to cap), notifications to each retiree ("You're invited to GOSI Opportunities"), audit.
   - **Manual invite**: enter a National ID → shows the GOSI record (must be a retiree, not already invited) → Invite.
   - **Waves table** (funnel per wave): invited, opened, started application, submitted, approved, delivered first session.
3. **Review queue**: pending applications (oldest first). Detail page shows Layer 1 record (employment history with sectors), Layer 2 fields, documents (open via signed URL), and each pending Service Type with its description. Per Service Type: **Approve** or **Not approve** with a reason code (required) + note (optional). Reason codes: `NOT_MATCHING` "Description doesn't match the Service Type", `INSUFFICIENT_EVIDENCE` "Not enough evidence of this role or experience", `DOCS_UNCLEAR` "Documents unclear or not relevant", `CONTENT_ISSUE` "Content not appropriate for publishing", `OTHER` "Other". Operator can also edit nothing on the retiree's behalf. On decision: update states (4.2), notify retiree, audit.
4. **Retirees** (Stage 10 monitoring list): columns exactly as PRD: name, mobile number, status (Active/Paused), approved Service Types, date approved, sessions delivered, aggregate rating, missed sessions, late cancellations, complaints (incl. upheld disputes), date of last session; plus Disputes and Earnings (held/released/paid out) when paid is on. Sort and filter. Row → detail with history (notes sent, status changes) and actions:
   - **Send a note** (template picker: `WELCOME_TIPS`, `LOW_RATING`, `MISSED_SESSION`, `LATE_CANCELLATIONS`, `COMPLAINT_RECEIVED`, `GENERAL`; editable body) → ops_notes + notification.
   - **Pause** (reason required) → state `paused`, listings hidden, future bookings cancelled and refunded, seekers notified, retiree notified. Retiree keeps full access to the rest of the GOSI app.
   - **Restore** → back to `active`.
   - No ID number shown anywhere in ops (mobile only).
5. **Reports and disputes**: tabs Complaints | Disputes. Dispute detail shows the evidence panel: booking, price, call join/leave timeline for both parties with durations, seeker's pre-session need and goal, rating and tags, the report. Actions: **Refund in full** (upheld, payment `refunded`, counts as a complaint against the retiree) or **Reject** (payment becomes `released` immediately if past the 48h window, otherwise at the normal release time). Decision note required. Shows due date and an "Overdue" badge after 10 working days. Retiree input is not requested. Complaints: **Close** with note.
6. **Review moderation**: pending written reviews → Approve / Reject.
7. **Settlement**: released-but-unpaid by retiree, **Run settlement** button, past payouts, CSV download.
8. **Audit log**: every operator, system and tech action with actor, action, entity, timestamp (app time), details.

---

## 9. Time, jobs and the demo clock

- All rule logic uses **app time** = `app_now()` in SQL / `getAppNow()` in TS (real now + `demo_clock_offset_seconds`). Never use `new Date()` or `now()` for business rules. UI clocks show app time.
- **Job processor** `processDue()` (idempotent, server-side TS, single transaction per item), steps in order:
  1. Expire `pending_payment` bookings past `hold_expires_at`.
  2. Send 24h and 1h session reminders (tracked in `bookings.reminders_sent`).
  3. Mark no-shows at `starts_at + 15 min` (6.2), refund if paid.
  4. Complete sessions where the scheduled end has passed and both parties have left; set `release_due_at = completed_at + 48h` on held payments; send the feedback prompt to the seeker.
  5. Auto-complete stragglers: confirmed bookings whose `ends_at + 3h` has passed with both joined but no final `left` (user closed the tab): `completed_at = ends_at`.
  6. Release held payments where `release_due_at <= app now` and there's no open dispute.
  7. Monthly settlement if app month > `last_settlement_period` month.
- **Triggers for `processDue()`:** (a) Supabase `pg_cron` every minute calling `/api/jobs/tick` through `pg_net` with `CRON_SECRET`; (b) after every demo-clock change; (c) lazily at most every 15 seconds on server page loads. Vercel Hobby cron is daily only, so don't rely on it.

---

## 10. Notifications to implement (in-app inbox + live banner)

| Trigger | To | Title | Link |
|---|---|---|---|
| Wave sent / manual invite | Retiree | You're invited to GOSI Opportunities | retiree start |
| Application submitted | Retiree | Application submitted | retiree status |
| Application submitted | All operators | New application to review | ops review item |
| Service Type approved | Retiree | "{Service Type}" is approved | retiree status |
| Service Type not approved | Retiree | Action needed: "{Service Type}" | retiree status |
| Go-live complete | Retiree | You're live on GOSI Opportunities | retiree home |
| Booking confirmed | Seeker + Retiree | Session booked: {date time} | booking |
| Reminder 24h / 1h | Seeker + Retiree | Your session starts in 24 hours / 1 hour | booking |
| Cancelled by other party | Other party | Session cancelled (+ "Book another slot" for seeker) | booking / browse |
| No-show | Both | Session marked as missed | booking |
| Session completed | Seeker | How was your session? | feedback |
| Ops note | Retiree | A note from GOSI | notes |
| Paused / restored | Retiree | Your profile has been paused / is active again | retiree home |
| Retiree paused with bookings | Seeker | Your session was cancelled. Book another | browse |
| Payment received (held) | Seeker | Payment received: SAR X | booking |
| Refund | Seeker | Refund of SAR X is on its way | booking |
| Dispute opened | Retiree | A payment is under review | earnings |
| Dispute opened | Operators | New dispute | ops dispute |
| Dispute decided | Seeker + Retiree | Your report has been reviewed | booking / earnings |
| Price clamped by band change | Retiree | Your price was updated | profile |
| Monthly payout | Retiree | SAR X sent to your pension bank account | earnings |
| Paid switched off | Affected seekers + retirees | Paid session cancelled and refunded | booking |

---

## 11. Seed data (`scripts/seed.ts`, run by "Reset demo data")

Wipes all tables except taxonomy and re-creates. Use realistic Saudi names. Times relative to app now.
- **Settings:** paid off, floor 50, ceiling 500, suggested Education 120, Accounting 180, clock offset 0.
- **Operators:** `op-noura` (Noura Al-Harbi), `op-khalid` (Khalid Al-Mutairi).
- **GOSI people:** ~40 retirees (mix of public/private/combined, sectors Education, Finance, Banking, Government, Construction, Healthcare, Retail; regions Riyadh, Makkah, Eastern Province, Madinah, Qassim, Asir), with 1–4 employment rows each and pension bank + masked IBAN; ~12 non-retirees (employees, residents incl. non-Arabic speakers), 1 user aged 16.
- **Retiree personas (cover every state):**
  - `ret-fahad`: retired English teacher, private pension, **not invited yet** (the live demo invites him from the ops wave).
  - `ret-mona`: retired Arabic teacher, **draft** at step 3.
  - `ret-saad`: retired accountant (GOSI sector reads Construction), **pending review** for VAT/Zakat and Bookkeeping (demo of the PRD example).
  - `ret-huda`: teacher, **not approved** for Exam prep (`INSUFFICIENT_EVIDENCE`), nothing approved yet.
  - `ret-abdullah`: accountant, **active**, 4.7★ from 18 sessions, many slots, one approved + one pending Service Type.
  - `ret-latifa`: English teacher, **active**, new (no ratings).
  - `ret-majed`: accountant, **active**, one late cancellation and one complaint, rating 3.4.
  - `ret-turki`: teacher, **paused** by ops with history.
  - 6 more active retirees across Service Types, so browse feels full; Nasser is fully booked for 30 days, and Khaled (`ret-extra-5`) is invited with the go-live checklist still open.
  - ~25 retirees not invited (wave candidates).
- **Seeker personas:** `seek-sara` (employee, 29), `seek-james` (non-Arabic-speaking resident, 41, wants Arabic), `seek-omar` (small restaurant owner, 35, wants VAT guidance), `seek-reem` (22), `seek-teen` (Yazan, 16, blocked).
  - **History:** one past wave ("Wave 1 · Riyadh teachers", 13 invited, including Khaled whose go-live checklist is incomplete) with funnel numbers; ~40 past completed sessions with a unique written review each (two pending moderation); upcoming confirmed bookings for `seek-sara` and `seek-omar` (one starting within 2 days); Nasser fully booked for 30 days; a no-show; a late cancellation; ops notes; audit history.
- **Paid history (pre-existing, even though the switch starts off):** a few historical paid sessions in each money state (released, paid out with a past payout, refunded) and one **open dispute** due in 6 working days, so ops screens are populated. (They were created during a past period when the switch was on; label in audit log.)
- Every persona's `blurb` describes their state for the Nafath picker and demo home.

---

## 12. Demo script (put as a checklist on the demo home)
1. Ops (Noura): create a wave of Riyadh English teachers, size cap 5, send → Fahad's phone shows the banner.
2. Fahad: open the card, complete the 5-step application with a CV upload, submit.
3. Ops: review Fahad, approve English conversation, not approve Exam prep with a reason → Fahad gets both outcomes, amends and resubmits.
4. Fahad: watch video, test call, set availability → live.
5. Sara (seeker): browse Education → Fahad → book a slot 2 days out with notes → both notified.
6. Demo clock: jump to next booking start → both join the real video call, share screen, leave → feedback.
7. Seeker cancellation within 3h on another booking → late cancel recorded.
8. Tech: turn paid sessions on, set band → Abdullah sets VAT session to SAR 180.
9. Omar books and pays (mock PSP) → +2 days → session no-show/complete → Held → +48h → Released.
10. Omar disputes a different paid session within 48h → Ops refunds in full → counts as complaint.
11. Jump to month end → settlement → Abdullah's payout notification.
12. Ops pauses Majed → his seekers get cancellations and refunds. Restore.
13. Tech: turn paid off → remaining paid bookings refunded.

---

## 13. Out of scope for the demo
Arabic UI, real Nafath/GOSI integrations, real payments, SMS/email, analytics/GTM events, KPI dashboards, session recording, file transfer, rescheduling, seeker-posted requests, multi-hour engagements.
