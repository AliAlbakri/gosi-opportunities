# UX/UI overhaul: GOSI Opportunities phone experience (final)

> Put this file at `docs/UX-OVERHAUL.md`. It is a **design and UX pass on top of the working build**. Keep all existing functionality, data and business rules (`docs/PRD.md`, `docs/DEMO-SPEC.md`, `.cursor/rules/*`). Where this file conflicts with DEMO-SPEC on screens, layout or entry logic, **this file wins**, and you must update DEMO-SPEC to match.

## 0. What's wrong today (fix all of it)

From the current build (screenshots of `/phone/*`):

1. **Wrong entry for retirees.** A retiree persona (home shows "Monthly pension") sees "Learn from experienced retirees" and lands on a list of other retirees. A retiree must land on the **retiree side**: an introduction to the initiative and how to apply.
2. **No onboarding story.** A new retiree gets no explanation of what GOSI Opportunities is, who it's for, how it works, what they need, or what happens after they apply.
3. **Browse looks like a debug list.** Text-only category boxes, retiree cards that are stacks of plain text lines, no avatar images, no visual hierarchy, a tiny "Verified by GOSI" line, every card showing the same next slot, unlabeled language chips, a bare "< Back" link with no title.
4. **Phone shell is unpolished.** Browser scrollbars visible inside the phone frame, flat status bar, service tiles without icons, a blue box as the "Story", a duplicate unstyled "Learn from experienced retirees" card at the bottom, Wafrah card missing its logo and progress bar.
5. **Booking is not an experience.** There is no proper slot picker, review step, success screen, booking detail, pre-call lobby or post-call flow at the level users expect from booking apps.
6. **Category → Service Type browse is a bare list.** The category is a white box with a title and Arabic name; its Service Types are plain green-tint text rows. No icon, no description, no retiree count, no price range, no chevron, no hierarchy between the category and its services.
7. **The retiree profile (what a seeker opens before booking) is a text dump.** Two "Back" controls stacked ("‹ Back" link and a "Back" heading); the verified block is a dark slab of run-on text with raw ISO dates ("1988-01-01") and placeholder copy ("Earlier employer"); the self-declared block is unstyled small text; the rating is a plain line; two reviews have **identical text**; the services the seeker came to book are at the very bottom; there is **no booking button in view**.

The bar: it must look and feel like a **real GOSI super-app feature** (match `reference/super-app/*.png`) with the booking UX quality of best-in-class expert and tutor marketplaces. If a screen would look out of place next to the real GOSI home screen, it isn't done.

### 0.1 Never ship (hard rules, check every screen)
- Two back controls, or a back control without a screen title.
- Raw dates or ISO strings (`1988-01-01`). Use `Jan 1988`, `1994 – 2017`, `Tue 11 Nov, 18:00`.
- Placeholder or debug copy ("Earlier employer", "Story", "test", "undefined", "null", lorem ipsum).
- Identical seeded text repeated on one screen (reviews, bios, descriptions).
- Text-only boxes where the pattern calls for an icon, image or avatar.
- Paragraphs of mixed facts in one block; facts go in labelled rows or chips.
- Visible scrollbars, default browser focus rings, default blue underlined links, unstyled form controls.
- A screen with no clear primary action, or the primary action below the fold on a booking screen.
- Small grey text under 4.5:1 contrast, text under 11px, tap targets under 44px.

---

## 1. Benchmarks to emulate (patterns, not branding)

Study these patterns and apply them in the GOSI brand. Don't copy their logos, colours or copy.

| Pattern | Benchmarks | Apply to |
|---|---|---|
| Expert/tutor card with photo, rating, sessions count, languages, price, next availability, whole card tappable | Preply, italki, ADPList | Retiree list cards |
| Profile with hero, stats row, about, services, reviews, and a **sticky bottom booking bar** (price + "Book") | Preply, Clarity.fm, Intro.co, Airbnb | Retiree profile |
| Day strip (horizontal dates) + time-slot grid grouped by part of day, time zone note, "next available" jump | Calendly, Cal.com, Zocdoc, ADPList | Slot picker |
| Short multi-step booking with progress, review-and-confirm, success screen with "Add to calendar" and "What to expect" | Calendly, Zocdoc, Airbnb | Booking flow |
| Filter bottom sheet + removable active filter chips + sort + results count | Airbnb, Preply | Search and browse |
| Pre-call lobby with camera/mic preview and tips | Google Meet, Zoom, Daily Prebuilt | Joining a session |
| Rating distribution bars + review cards | Airbnb, Preply | Reviews |
| Onboarding landing: hero, value props, "How it works" timeline, requirements, FAQ, sticky CTA | ADPList "Become a mentor", Preply "Become a tutor", Airbnb "Become a host" | Retiree introduction |
| Application tracker with steps and per-item status | Airbnb host listing status, government e-services trackers | Application status |
| Category landing with cover, short intro, service tiles with icon + count, then providers | Airbnb Experiences categories, Preply subject pages, Careem/HungerStation category screens | Category and Service Type browse |
| Profile "at a glance" stats + credential timeline (dates as ranges) | LinkedIn experience, ADPList mentor profile | Verified by GOSI block |

### 1.1 Design principles (the quality bar)
1. **One job per screen, one primary action**, always visible (sticky footer on booking screens).
2. **Hierarchy before decoration**: a clear title, a short supporting line, then grouped content. Size and weight carry hierarchy, not colour alone.
3. **Chunk, don't dump**: facts in labelled rows, chips or stat tiles; text paragraphs max 3 lines with "Read more".
4. **Show trust where the decision is made**: verified badge on every card, verified block high on the profile, policy lines next to the confirm button.
5. **Progressive disclosure**: summaries first, details on tap (accordions, sheets, "See all").
6. **Generous whitespace and rhythm**: 20px side padding, 24–32px between sections, consistent card padding.
7. **Real-feeling content**: varied, natural seeded copy; no repeated strings.
8. **Feedback for every action**: pressed states, skeletons while loading, toasts on success, inline errors, celebratory success screens at milestones (application submitted, you're live, booked).
9. **Familiar patterns over novelty**: people already know how Preply, Airbnb and Calendly work; reuse those mental models in GOSI's look.

### 1.2 Sawalef design system (reuse what fits)
If `reference/sawalef/` exists in this repo (design tokens, component code, screenshots or a design doc from the Sawalef project), read it before building and **reuse its interaction and layout patterns where they apply**: card composition, motion and transitions, micro-interactions, onboarding and stepper patterns, empty and success states, form styling, spacing rhythm and copy tone. **GOSI brand always wins** on colours, logo, fonts and iconography: re-skin anything taken from Sawalef in GOSI tokens. Log in `BUILD-LOG.md` which Sawalef patterns you reused and where. If the folder doesn't exist, skip this section.

---

## 2. Design system (apply everywhere in `/phone`)

Build these as shared components in `components/phone/ui/` first, then use them on every screen. Do not hand-style screens one by one.

**Tokens.** Use GOSI tokens only (see `.cursor/rules/10-brand-ui.mdc`). Page background Midnight 10% `#E6E7EA`, cards white, primary text Rich Blue `#00004E`, secondary Midnight 50% `#808996`, primary CTA Vivid Green `#00BF00` with Rich Blue label, links/accents Blue `#0064FF`.

**Type scale** (Inter fallback for Ping): Display 28/34 bold · Title 22/28 bold · Section 18/24 semibold · Body 15/22 regular · Body-strong 15/22 semibold · Caption 13/18 · Micro 11/14 semibold uppercase tracking 0.4. No text below 11px.

**Spacing and shape.** 4pt grid. Page side padding 20px. Gaps 8/12/16/24/32. Card radius 20px, inner radius 14px, pills fully rounded. Shadow only `0 1px 2px rgb(0 18 45 / 6%)` plus `0 8px 24px rgb(0 18 45 / 6%)` for raised cards and sheets.

**Components to build:**
- `AppHeader`: sticky, 56px, white or transparent-over-hero variant, 40px circular back button (chevron icon), centred title (Section style, ellipsis), optional right action. Blurs background on scroll. Replace every "< Back" link.
- `PrimaryButton` (52px, green pill, Rich Blue label, optional trailing arrow), `SecondaryButton` (white, Rich Blue 25% border), `TextButton` (Blue), `IconButton` (48px white circle). Pressed state scale 0.98. Disabled = Midnight 25% bg.
- `StickyFooter`: white, top hairline, safe-area padding, holds 1–2 buttons or a price + button pair.
- `Card`, `SectionHeader` (title + optional "View all →" with green arrow, like the super-app).
- `Chip` (filter, selectable, removable), `StatusPill` (Live / Pending review / Not approved / Paused / Approved / Free / Paid / New), `VerifiedBadge` (Blue check-shield icon + "Verified by GOSI", two sizes).
- `Avatar`: see §2.1. Sizes 40/56/72/96.
- `RatingStars` (read-only + input), `RatingSummary` (score, stars, count, distribution bars).
- `BottomSheet` (drag handle, 24px top radius, backdrop, swipe-to-close) for filters, cancel confirmation, T&C, payment, time-range picker.
- `Stepper` (segmented progress bar + "Step 2 of 5 · Your background"), `Timeline` (vertical steps with icon, title, caption, state done/current/upcoming).
- `DayStrip` + `SlotGrid` (§5.6).
- `FormField` (label, helper, error, character counter), `TextArea` with counter, `UploadTile`, `Toggle`, `SegmentedControl`.
- `EmptyState` (GOSI illustration from `public/brand/illustrations/`, title, text, action), `Skeleton` loaders for every list and profile, `Toast`.

**Iconography.** Use official GOSI icons from `public/brand/icons/` wherever a concept exists (calendar, chat, certified-document, individuals, individual-m, individual-f, financial-investment, development, security, settings, search, benefits, insurance, partnership, values-culture, strategy). Rich Blue on white, white on dark, green tint tiles for feature icons. Otherwise lucide-react, stroke 1.75. No text-only tiles anywhere.

**Motion.** 200ms ease-out page pushes (slide from right), sheets slide up, success check draws in. Respect `prefers-reduced-motion`.

### 2.1 Avatars and imagery (no real photos of people)
- **Profile photo is now an optional field** in the retiree application (step 2). Upload to Storage, circular crop preview. Add a `photo_path` column via a new migration.
- **Default avatar = branded monogram:** circle with a Rich Blue → Blue (`#00004E` → `#0064FF`) diagonal gradient, white initials (2 letters, semibold), and a small Vivid Green arrow notch at the bottom-right edge. Deterministic per person so it never changes. It must look intentional, not like a grey placeholder.
- **Category covers:** generate two SVG cover images in `public/opportunities/`: Rich Blue background, large tone-on-tone GOSI arrow cropped off the edge (`#333371`), a white GOSI icon in a green-tint circle (Education: `development` or `individuals`; Accounting: `financial-investment`), category name. Use them on category cards and category page headers.
- **Hero illustrations:** use `public/brand/illustrations/illustration-0X.png` on the retiree landing, success screens and empty states. Use `pattern-*` images subtly in hero backgrounds.
- **Story card on home:** use a pattern/illustration image instead of a flat blue box.

### 2.2 Phone shell fixes
- Hide scrollbars inside the phone (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`), `overscroll-behavior: contain`, smooth momentum scroll. Content scrolls under a fixed status bar and a fixed tab bar.
- Status bar: app time on the left in SF-like semibold, Dynamic Island centred, right side real SVG icons for signal, Wi-Fi and battery (not "5G 100%" text). Add the home indicator bar above the bottom edge.
- Safe areas: content never touches the island or the home indicator.
- The tab bar matches the screenshot exactly (icons + labels, green dot under active). Inner Opportunities screens hide the tab bar and use `AppHeader` + `StickyFooter`.

---

## 3. Home screen and entry logic

### 3.1 Home fidelity (match `reference/super-app/04–06`)
Header with avatar, "Good evening," + first name in caps, four round icon buttons (bell with unread dot, search, ع, mic). Announcement carousel with page dots. Story thumbnail (image) + status card (blue "Monthly pension" tab for retirees, masked amount with eye toggle, label/value grid). Voice search bar with green chevron. "GOSI Services" grid with green line icons and two-line labels. "Wafrah Program" card with the GOSI Financial Literacy lockup, "Current Path", "Saving", green progress bar and percentage. "You Might Be Interested" horizontal carousel of Rich Blue promo cards with illustration on the right and a green "Start now" pill.

### 3.2 Who sees what (replace the current logic)
| Persona | GOSI Opportunities on home |
|---|---|
| **Retiree, invited** | One **retiree hero card** (state-aware, §4.1) in a "GOSI Opportunities" section placed right after GOSI Services. **No seeker card.** |
| Retiree, not invited | Nothing (PRD: uninvited retirees don't see the entry point). |
| Non-retiree, 18+ | One **seeker hero card** in the section, plus one promo card in "You Might Be Interested". |
| Under 18 | Seeker card; tapping it opens the "Available for users aged 18 and over" screen. |

Remove the duplicate unstyled card at the bottom of home. Update `docs/DEMO-SPEC.md` §2.2 and §3.4 to this table.

---

## 4. Retiree experience (invited retiree)

### 4.1 Retiree hero card (home)
Rich Blue card, large tone-on-tone arrow on the right, white title, white 80% subtitle, green CTA. Small top label "GOSI Opportunities". Copy and CTA by state:
- Invited, not started: "Your experience still matters" / "You're invited to share it with people who need it" / **Learn more** → §4.2.
- Draft: "Continue your application" / progress bar "Step 3 of 5" / **Continue**.
- Pending review: "Your application is under review" / "We'll notify you here" / **View status**.
- Not approved items: "Action needed on your application" / **Review and resubmit**.
- Approved, go-live incomplete: "Almost live: 2 of 3 steps done" / **Finish setup**.
- Active: "Next session: Tue 11 Nov, 18:00" (or "No upcoming sessions") + rating / **Open**.
- Paused: "Your profile is paused" / **View details**.

### 4.2 Retiree landing page (new): "GOSI Opportunities for retirees"
Shown on first tap and always reachable from the dashboard ("About the programme"). Sections, top to bottom:
1. **Hero** (Rich Blue, transparent `AppHeader`, illustration, pattern): "Your experience still matters" / "GOSI Opportunities lets you share what you've learned in your career through one-hour video sessions in the GOSI app." Pill: "You're invited".
2. **Why join** (3 icon cards): Share what you know · Choose your own times · Verified by GOSI ("Seekers see your GOSI-verified experience, so they know who they're learning from").
3. **Who it's for in this phase**: two category cards with cover art, each listing its Service Types (fixed list from DB) and one example line.
4. **How it works** (`Timeline`, 5 steps): 1 Apply (about 10 minutes, your GOSI record fills in automatically) → 2 GOSI reviews each service (we'll notify you in the app) → 3 Get ready (short video + test call) → 4 Set your availability → 5 Start sessions (one hour, by video, in the GOSI app).
5. **What you'll need**: your GOSI record (already here), a short description of each service, certificates or CV (optional), a phone with camera and internet.
6. **Good to know**: sessions are free for now (when the paid switch is on: "you can choose free or paid for each service"), one hour each, you can pause new bookings any time, either side can cancel up to 3 hours before, terms are shown before you submit.
7. **FAQ** accordion (6): What is GOSI Opportunities? · Who can book my sessions? (users aged 18+ in the GOSI app) · How long does review take? · What do seekers see about me? (verified vs self-declared) · Can I stop or pause? · Are sessions recorded? (No.)
8. `StickyFooter`: **Start my application** (primary) + "Not now" (text).

### 4.3 Application wizard (redesign)
Full-screen flow, `AppHeader` title "Your application" with a close (X) that confirms "Your progress is saved". Top `Stepper` with step names: 1 GOSI record · 2 Background · 3 Documents · 4 Services · 5 Review. A subtle "Saved" indicator after autosave. `StickyFooter` with Back + Continue (Continue disabled until required fields pass; inline errors on blur).
1. **Your GOSI record**: verified card (Rich Blue header with `VerifiedBadge`): name, retiree status, pension system, years of experience, last active year, employment timeline (employer, sector, dates). Three toggles "Show on my profile: employers / dates / sector" with a **live preview** card "How seekers will see this".
2. **Your background**: optional **profile photo** (UploadTile with circular preview, fallback monogram), Professional discipline and role (required, example placeholder "Secondary school English teacher, 25 years"), Specializations, Personal introduction (counter, tip "Write as if introducing yourself to a new student"), Languages (selectable chips, ≥1). Label: "Self-declared. GOSI reviews this before it's published."
3. **Documents**: two `UploadTile`s (Certificates: multiple; CV: one), file rows with type icon, size, remove, upload progress; note "Optional, but helps GOSI review faster".
4. **What you'll offer**: two category cards with cover art (select one or both) → Service Type cards with checkbox; checking expands a description textarea (80–800 chars, counter, example from PRD, tip "Explain what a seeker will get from one hour with you").
5. **Review and submit**: summary sections with "Edit" links back to each step; T&C in a `BottomSheet` that must be scrolled to the end before "I agree" enables; **Submit for review**.
**Success screen**: illustration, "Application submitted", "What happens next" mini timeline (review → notification → get ready), **Back to home** and **View status**.

### 4.4 Application status tracker
`Timeline`: Submitted ✓ → Under review (current) → Get ready → Live. Below, per Service Type rows with `StatusPill`. Not approved rows show a callout with the reason text and operator note and an **Edit and resubmit** button that opens that service's description inline. "Add another service" link.

### 4.5 Go-live checklist
Header "Almost live" with a progress ring (x of 3). Three task cards (icon, title, one-line why, state, action): Watch the onboarding video (in-app player screen) · Do a test call (camera/mic preview screen with "I can see and hear myself") · Set your availability (§4.6). Completing all three → full-screen "You're live" celebration (illustration, confetti-lite) → dashboard.

### 4.6 Availability editor
Weekly view: seven day rows (Sun → Sat), each with time-range chips ("18:00–21:00") and "+ Add". Add/edit in a `BottomSheet` with start/end hour wheels (06:00–23:00, whole hours). Below: "Preview: your next bookable slots" (horizontal chips for the next 7 days). Toggle at top: **Accepting new bookings** (self-pause) with explanation.

### 4.7 Retiree dashboard (active)
- Header: greeting, `StatusPill` "Live" (or "New bookings paused"), avatar.
- **Next session hero card**: date block, countdown ("in 2 days"), seeker first name, Service Type, Free/Paid pill, seeker's need and goal (2-line preview, expand), **Join** (enabled 10 min before start; otherwise disabled with "Opens 10 minutes before"), Cancel (text).
- Stats row: sessions delivered · rating (aggregate only) · upcoming.
- Segmented tabs: **Sessions** (upcoming / past cards) · **Availability** · **Profile** ("Preview as seekers see it" + edit + services with status and free/paid pricing when paid is on) · **Earnings** (paid switch on only: Held / Released / Paid out tiles with one-line definitions, list, payouts).
- "Notes from GOSI" card list. "About the programme" link to §4.2.
- **Retirees never see individual ratings, reviews or who rated them.**

---

## 5. Seeker experience

### 5.1 Opportunities home (seeker landing), replace the current list
1. **Hero** (Rich Blue, transparent header, pattern): "Learn from experienced retirees" / "One-hour video sessions with people verified through GOSI records." Large search field inside the hero (tapping opens §5.3).
2. If the seeker has an upcoming booking: **"Your next session" banner** card (date, retiree, Join/Details).
3. **How it works** (3 compact steps with icons): Choose a retiree · Book an hour · Meet by video.
4. **Browse by category**: two large cards with cover art, Arabic name as secondary line, "4 services · 12 retirees".
5. **Popular services**: horizontal chips of Service Types.
6. **Available this week**: horizontal carousel of compact retiree cards (avatar, name, verified, rating, next slot).
7. **Top rated** and **New on GOSI Opportunities**: carousels.
8. Trust strip: shield icon + "Every retiree is verified through GOSI records. Sessions are guidance based on professional experience, not a licensed professional service."

### 5.2 Category and Service Type browse (replace the current boxes)
**Category cards on the Opportunities home** (two, full width, 160px tall): cover art background (§2.1), white category name (Title), Arabic name below in white 80% (Caption, right-aligned under it is fine), bottom row of two white-on-glass pills: "4 services" · "12 retirees", trailing circular arrow button. Whole card tappable.

**Category page** (see wireframe A.2):
1. Collapsing cover header (200px → 56px `AppHeader` on scroll): cover art, category name, Arabic name, one-line blurb from `categories.blurb`.
2. **Services in this category**: list of Service Type rows inside one white card, each row 64px: green-tint 40px icon tile (GOSI icon chosen per Service Type), name (Body-strong, 2 lines max), meta line "6 retirees · Free" or "6 retirees · from SAR 120" (Caption, secondary), chevron. Dividers between rows. Never green-filled text bars.
3. **Retirees in this category**: section header with "See all", 3 retiree cards (§5.4), then "See all 12 retirees" button.
4. Trust strip at the bottom.

**Service Type page**: `AppHeader` with the Service Type name; short explainer card (what this service is, typical session, "Guidance only" note for Accounting); sort + filter bar; full list of retiree cards offering it, each card showing that retiree's description snippet for this service.

Icon mapping (GOSI icons, fall back to lucide): English lessons → `chat`; Arabic for non-Arabic speakers → `individuals`; Other languages → `connect`; Language exam prep → `certified-document`; Small business accounts → `business`; Bookkeeping → `settings`; Financial statements → `financial-investment`; VAT and Zakat → `insurance`. Education category → `development`; Accounting category → `financial-investment`.

### 5.3 Search and filters
Search screen with recent searches and suggestions (Service Types, languages). Results show count ("12 retirees"), **Sort** (Recommended, Soonest available, Highest rated, Most sessions) and **Filters** button with count badge. Filter `BottomSheet`: Service Type · Language (labelled "Session language") · Availability (Any time / Today / Tomorrow / This week, plus Morning / Afternoon / Evening) · Rating 4+ · Price Free/Paid (paid switch on only) → "Show 8 retirees" button. Active filters as removable chips under the bar. Empty state with illustration and "Clear filters".

### 5.4 Retiree card (list)
Whole card tappable, white, radius 20, padding 16:
- Row 1: Avatar 64 · name (Body-strong) + `VerifiedBadge` icon · discipline (Caption, 1 line) · "25 yrs experience · Arabic, English".
- Row 2: `RatingStars` + "4.8 (21 sessions)" or `StatusPill` "New".
- Row 3: up to 2 Service Type tags + "+1".
- Divider, then footer row: price ("Free" or "SAR 150 / hour") left; next availability chip right ("Tomorrow, 18:00" in green-tint, or "Fully booked for now" in grey) + chevron.
Next availability must be computed per retiree from real availability and bookings. **Fix seed data so retirees have varied availability and next slots** (not all the same time).

### 5.5 Retiree profile (the page a seeker opens to book; see wireframe A.3)
One `AppHeader` only (back button + share/heart icon buttons on the right, title appears on scroll). Order, top to bottom:
1. **Hero** on white: avatar 96 centred (or left-aligned with text to the right), name (Title), `VerifiedBadge` pill under the name, discipline line ("Accountant · 29 years of experience"), language chips ("Arabic", "English").
2. **Stats row**: three equal tiles in one card, divided: ★ 4.8 "21 reviews" · 21 "sessions" · 29 "years experience". Show "New" instead of rating for new retirees.
3. **Next available**: green-tint card "Next available: Tomorrow, 18:00" + "See all times ›" (opens the booking flow at step 2).
4. **Services offered**: one card per approved Service Type: icon tile, name (Body-strong), price pill (Free / SAR 150), description (3 lines + "Read more"), "Book this ›" text button. This is the main content; it sits high, not at the bottom.
5. **About**: introduction (3 lines + "Read more"), specializations as chips.
6. **Verified by GOSI**: white card with a Rich Blue header strip (shield-check icon + "Verified by GOSI" + info icon that opens a sheet explaining what GOSI verifies and what it doesn't). Body as labelled rows: Status "Confirmed retiree" · Experience "29 years" · Last active "2017" · then an **employment timeline** (only if the retiree chose to show it): vertical dots with employer name (Body-strong), sector chip, and the date range "Jan 1994 – Mar 2017". Never ISO dates, never "Earlier employer" (hide entries without a real employer name, or show "Employer hidden by the retiree").
7. **Self-declared by the retiree**: white card with a grey header strip (person icon + "Self-declared, reviewed by GOSI"). Rows: Role, Specializations, Languages, Documents ("CV and 2 certificates provided"). Distinct from the verified block by header colour and icon, same card style.
8. **Reviews**: `RatingSummary` (big 4.8, stars, "21 reviews", distribution bars 5→1), then 3 review cards (avatar monogram, first name, month, stars, text, helpful tags as chips) and "Show all reviews". Each review text unique.
9. Disclaimer in Caption, secondary colour, with an info icon.
10. **StickyFooter** (always visible): left "Free" or "SAR 150" (Body-strong) + "1-hour video session" (Caption); right **Book a session** (primary). Fully booked: "Fully booked for now" + disabled button + "Notify me" text button (stores interest, no other effect in the demo).

### 5.6 Booking flow (full-screen, 4 steps with `Stepper`)
1. **Service** (skip if the retiree offers one): radio cards with name, short description, price.
2. **Date and time**:
   - Month label with prev/next week arrows; `DayStrip` of 7 day pills (weekday + date), days with availability show a green dot, unavailable days are greyed and disabled, selected day is Rich Blue.
   - `SlotGrid` grouped under Morning / Afternoon / Evening headings; chips show "18:00–19:00"; selected chip is green with Rich Blue text.
   - Notes: "All times are Riyadh time" · "Book at least 24 hours ahead, up to 30 days".
   - Empty day: "No times on this day" + **Jump to next available (Thu 13 Nov)**.
   - Default selection: the first day with availability.
3. **Your needs**: two required textareas ("What do you need help with?", "What do you want out of the session?") with example placeholders and counters, tip "This helps the retiree prepare".
4. **Review and confirm**: summary card (avatar, retiree, service, date, time, duration, price), "Cancellation: free up to 3 hours before. Paid sessions are refunded in full if the session doesn't happen.", disclaimer, T&C checkbox (sheet), `StickyFooter` **Confirm booking** (free) or **Continue to payment** (paid → PSP sheet).
- If the slot was taken meanwhile: toast "That time was just booked. Please pick another." and return to step 2 with refreshed slots.
- **Success screen**: animated check, "You're booked", details card, **Add to calendar** (downloads an .ics), "What to expect" tips (find a quiet place, test your camera, join from My bookings 10 minutes before), **View my bookings** / **Back to Opportunities**.

### 5.7 My bookings and booking detail
- Entry: "My bookings" button in the Opportunities header (calendar icon) with a count badge.
- Tabs Upcoming / Past. Booking card: date block (day number + month), time, retiree avatar + name, service, `StatusPill`, countdown, Join state.
- Booking detail: header card, your notes, status timeline (Booked → Reminder → Session → Feedback), actions: **Join** (from 10 min before), **Cancel** (sheet shows policy and a warning if within 3 hours: "This will be recorded as a late cancellation"), **Report a problem**, **Book again** (past).

### 5.8 Sessions
- **Pre-call lobby**: camera preview, mic/camera toggles, "Joining as Sara", session info, tips, **Join now**.
- **In-call**: full phone viewport, top bar with service and timer, the 60-minute banner, leave confirmation sheet ("Leaving won't end the session for the other person").
- **After the call (seeker)**: feedback flow, big tappable stars, "Did this help?" Yes/No, tag chips, optional review, **Submit** → thanks screen with **Book again**. Retiree after the call: simple "Session complete" screen back to dashboard.

### 5.9 Under 18 and paused/blocked states
Friendly full-screen states with illustration and clear copy; never a raw error.

---

## 6. Copy rules
Warm, short, second person. Sentence case. "Retiree" never "provider/expert/mentor". "Service Type" in admin; in the phone use "service". No "manually". Every screen has a clear title and one primary action.
Formatting (put helpers in `lib/format.ts` and use them everywhere): session time "Tue 11 Nov, 18:00"; relative "Today, 18:00" / "Tomorrow, 18:00"; employment range "Jan 1994 – Mar 2017"; years "29 years"; month for reviews "November 2026"; price "Free" / "SAR 150"; counts "1 session" / "21 sessions" (pluralise correctly); ratings one decimal "4.8".

## 7. Ops console (light polish only)
Overview stat cards with icons, PRD-style tables (Rich Blue header row, zebra rows), status pills consistent with the phone, review detail as two columns (record and documents left, Service Type decisions right), avatars in lists, empty states. No layout rewrites beyond that.

## 8. Seed data upgrades
- ≥3 active retirees per Service Type, varied ratings (3.4–4.9), sessions counts, years of experience, languages, introductions and service descriptions written in natural English (no lorem ipsum).
- Varied weekly availability (mornings, evenings, weekends) so next slots differ; one retiree fully booked for 30 days.
- 3–8 approved written reviews per experienced retiree, **every review text unique** (write a pool of 60+ distinct, specific reviews tied to the Service Type, e.g. "He explained the VAT return line by line using my restaurant's invoices"); reviewer first names varied; a few retirees "New".
- Plausible fictional employer names per sector (e.g. "Riyadh Secondary Schools, Ministry of Education", "Al-Faisal Accounting Co.", "Gulf Contracting Group"), real date ranges, no "Earlier employer".
- Each retiree has a distinct introduction (2–4 sentences, first person) and a distinct description per Service Type.
- Retiree personas covering every card state in §4.1 (invited not started, draft, pending, not approved, go-live incomplete, active, paused).
- All seeded retirees use monogram avatars; the photo upload is shown live in the demo.

## 9. How to execute
1. **Audit first.** Write `docs/UX-AUDIT.md`: every phone screen and state, what exists, what's missing against this file and the §0.1 never-ship list. If `reference/sawalef/` exists, add a short "Sawalef patterns to reuse" list (§1.2). Then implement.
2. Build the §2 design system components and the §2.2 shell fixes first.
3. Then §3 → §4 → §5 → §7 → §8 in order. Commit after each section ("UX: <section>").
4. **Visual check with Playwright** (already installed with Next tooling or add it): `scripts/screens.ts` opens each key route at 390×844 for the relevant personas and saves PNGs to `screenshots/`. After each section, run it, look at every screenshot yourself, compare with `reference/super-app/*.png` and this file, and fix spacing, hierarchy and alignment before moving on.
5. Update `docs/DEMO-SPEC.md` for every behaviour change (entry logic, profile photo, new screens) and log decisions in `BUILD-LOG.md`.
6. Don't break existing flows: after finishing, run the DEMO-SPEC §12 demo script end to end.

## 10. Acceptance checklist
- [ ] An invited retiree on home sees only the retiree hero card; tapping it opens the landing page with hero, why join, categories, how it works, what you'll need, good to know, FAQ and a sticky Start CTA.
- [ ] An uninvited retiree sees no Opportunities section; a non-retiree sees the seeker card.
- [ ] The application is a 5-step wizard with stepper, autosave indicator, sticky footer, inline validation, live profile preview, optional photo, review with edit links and a success screen.
- [ ] Application status, go-live checklist and "You're live" screens exist and look finished.
- [ ] Seeker Opportunities home has hero search, categories with cover art, carousels and trust strip.
- [ ] Retiree cards have avatar, verified badge, rating, tags, price and varied next availability.
- [ ] Profile has stats, services, verified vs self-declared blocks, availability preview, reviews summary and a sticky booking bar.
- [ ] Booking: 4 steps with day strip, grouped slot grid, needs, review, success with .ics.
- [ ] My bookings, booking detail, cancel sheet with late warning, pre-call lobby, in-call, feedback flow.
- [ ] No scrollbars inside the phone, real status bar icons, every inner screen uses `AppHeader`, no text-only tiles, skeletons and empty states everywhere.
- [ ] Category cards have cover art and counts; the category page shows Service Types as icon rows with retiree count and price range, then retirees; each Service Type has its own page.
- [ ] Retiree profile: one back control, hero + stats row, next available, services high on the page, verified block with an employment timeline (date ranges, no ISO dates, no placeholder employers), separate self-declared block, review summary with unique reviews, sticky booking bar always visible.
- [ ] Nothing on the §0.1 never-ship list appears on any screen.
- [ ] Layouts match the Appendix A wireframes in structure.
- [ ] Screenshots of every screen saved in `screenshots/` and reviewed.

---

## Appendix A: wireframes (structure to follow; style per §2)

Symbols (🔍 🛡 📅 ★ ⓘ ●) stand for GOSI or lucide icons; never render emoji in the UI. Spacing and sizes come from §2, not from the character grid.

### A.1 Seeker Opportunities home
```
┌──────────────────────────────────┐
│ ‹  GOSI Opportunities      [📅2] │  ← AppHeader over Rich Blue hero
│                                  │
│  Learn from experienced retirees │  Display, white
│  One-hour video sessions with    │  Body, white 80%
│  people verified by GOSI records │
│ ┌──────────────────────────────┐ │
│ │ 🔍 Search services or names  │ │  white search field, radius 14
│ └──────────────────────────────┘ │
├──────────────────────────────────┤  page bg Midnight 10%
│ ┌ Your next session ───────────┐ │  only if booked
│ │ [11 NOV] Abdullah · VAT  Join│ │
│ └──────────────────────────────┘ │
│  How it works                    │
│  (1)Choose  (2)Book   (3)Meet    │  3 icon steps in one card
│  Browse by category              │
│ ┌──────────────────────────────┐ │
│ │▓ cover art  Education and    │ │  160px cover card
│ │▓            Training         │ │
│ │▓ التعليم والتدريب            │ │
│ │ (4 services)(12 retirees) (→)│ │
│ └──────────────────────────────┘ │
│ ┌ Accounting and Finance ──────┐ │
│ └──────────────────────────────┘ │
│  Popular services          →     │  chips row
│  Available this week   See all → │  horizontal cards
│  [AA ★4.8 Tmrw 18:00] [KT New..] │
│  Top rated · New on GOSI Opps    │
│  🛡 Every retiree is verified... │  trust strip
└──────────────────────────────────┘
```

### A.2 Category page
```
┌──────────────────────────────────┐
│ ‹                          ♡     │  transparent header over cover
│▓▓▓▓▓▓ cover art ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  Accounting and Finance          │  Title, white
│  المحاسبة والمالية                │
│  Guidance from retired           │  blurb
│  accountants. Guidance only.     │
├──────────────────────────────────┤
│  Services in this category       │
│ ┌──────────────────────────────┐ │
│ │[ic] Understanding small      │ │  icon tile 40 + name
│ │     business accounts      › │ │
│ │     6 retirees · Free        │ │  meta
│ │──────────────────────────────│ │
│ │[ic] Setting up bookkeeping › │ │
│ │     4 retirees · from SAR 120│ │
│ │──────────────────────────────│ │
│ │[ic] Financial statements   › │ │
│ │──────────────────────────────│ │
│ │[ic] VAT and Zakat          › │ │
│ └──────────────────────────────┘ │
│  Retirees in this category See all│
│  [retiree card]                  │
│  [retiree card]                  │
│  [ See all 12 retirees ]         │
└──────────────────────────────────┘
```

### A.3 Retiree profile (seeker view)
```
┌──────────────────────────────────┐
│ ‹                        ⤴  ♡    │  single AppHeader
│        ( AD )                    │  avatar 96, monogram
│     Abdullah Al-Dosari           │  Title
│   [🛡 Verified by GOSI]           │  badge pill
│  Accountant · 29 years experience│
│     (Arabic) (English)           │
│ ┌──────────┬──────────┬────────┐ │
│ │ ★ 4.8    │ 21       │ 29     │ │  stats row
│ │21 reviews│ sessions │ years  │ │
│ └──────────┴──────────┴────────┘ │
│ ┌ Next available: Tomorrow 18:00 ┐│  green tint
│ └──────────────── See all times ›┘│
│  Services offered                │
│ ┌──────────────────────────────┐ │
│ │[ic] Small business accounts  │ │
│ │     [Free]                   │ │
│ │ I spent 22 years as an acc...│ │  3 lines + Read more
│ │                  Book this › │ │
│ └──────────────────────────────┘ │
│  About                           │
│ ┌ 🛡 Verified by GOSI        ⓘ ─┐ │  Rich Blue header strip
│ │ Status      Confirmed retiree│ │
│ │ Experience  29 years         │ │
│ │ Last active 2017             │ │
│ │ ● Riyadh Accounts Bureau     │ │  timeline
│ │ │ [Finance] Jan 1994–Mar 2017│ │
│ │ ● Al-Faisal Accounting Co.   │ │
│ │   [Finance] Jan 1988–Dec 1993│ │
│ └──────────────────────────────┘ │
│ ┌ 👤 Self-declared, reviewed... ┐ │  grey header strip
│ │ Role  Senior accountant ...  │ │
│ │ Documents  CV, 2 certificates│ │
│ └──────────────────────────────┘ │
│  Reviews   4.8 ★★★★★  21 reviews │
│  5 ████████████  4 ███  3 █ ...  │
│  [review card] [review card]     │
│  ⓘ Sessions are guidance only... │
├──────────────────────────────────┤
│ Free                [Book a    ] │  sticky footer
│ 1-hour video session[ session  ] │
└──────────────────────────────────┘
```

### A.4 Booking: date and time
```
┌──────────────────────────────────┐
│ ‹   Book a session               │
│ ━━━━━━━━━━━━━━━━░░░░░░░ Step 2/4 │
│ (AD) Abdullah · Small business   │  context strip
│  November 2026            ‹  ›   │
│ [Sun][Mon][Tue][Wed][Thu][Fri][Sat]│ day pills, dots = availability
│  9   10  (11)  12   13   14   15 │
│  Morning                          │
│  (09:00–10:00) (10:00–11:00)     │  slot chips, 2 per row
│  Evening                          │
│  (18:00–19:00) (19:00–20:00)     │
│  Riyadh time · book 24h–30 days  │
├──────────────────────────────────┤
│ Tue 11 Nov, 18:00   [ Continue ] │  sticky footer
└──────────────────────────────────┘
```

### A.5 Retiree landing (invited retiree)
```
┌──────────────────────────────────┐
│ ‹  (Rich Blue hero, arrow device)│
│  [You're invited]                │
│  Your experience still matters   │  Display, white
│  Share what you've learned in    │
│  one-hour video sessions in the  │
│  GOSI app.        [illustration] │
├──────────────────────────────────┤
│  Why join   [ic][ic][ic] cards   │
│  Who it's for: 2 category cards  │
│  How it works                    │
│  ● Apply (about 10 minutes)      │  Timeline
│  │ GOSI reviews each service     │
│  │ Get ready: video + test call  │
│  │ Set your availability         │
│  ● Start sessions                │
│  What you'll need (checklist)    │
│  Good to know (rows)             │
│  FAQ (accordion)                 │
├──────────────────────────────────┤
│ [   Start my application   ]     │  sticky
│           Not now                │
└──────────────────────────────────┘
```
