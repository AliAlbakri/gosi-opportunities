# UX audit

Compared with `docs/UX-OVERHAUL.md` and its §0.1 never-ship list. `reference/sawalef/` is not in this repo, so no Sawalef patterns are reused.

## Already correct

- Uninvited retiree (Fahad) has no GOSI Opportunities section on home.
- A retiree who opens `/opportunities` is sent to the retiree side, not the catalog.
- Seekers 18+ see “Learn from experienced retirees” and can open browse.
- Application save, upload, submit, status, go-live actions, availability windows, booking, payment sheet, call frame, feedback and report actions exist and must keep working.

## Phone screens

| Route | Exists | Gap against the overhaul |
|---|---|---|
| `/phone` splash and welcome | Yes | Not part of this pass. |
| `/phone/[id]/home` | Yes | Missing four header buttons, announcement dots, story image, eye toggle, Wafrah progress, “You Might Be Interested”. Retiree card copy is not the §4.1 set. Seeker promo is not in a carousel. |
| `/phone/[id]/notifications`, `/more` | Yes | Plain lists. No `AppHeader`. |
| `/opportunities` seeker home | Yes, as a filter list | No hero, covers, counts, carousels, or trust strip. Language chips are unlabeled. |
| `/opportunities/c/[id]`, `/t/[id]` | Missing | Category and Service Type are query params on one list. |
| `/opportunities/p/[id]` profile | Yes | Second Back control, ISO dates, services at the bottom, no sticky Book bar, reviews can repeat. |
| `/opportunities/p/[id]/book` | Yes | One form, not a 4-step day strip and slot grid. No success screen or `.ics`. |
| `/opportunities/bookings` and detail | Yes | Cards are text. No date block, timeline, or late-cancel sheet. |
| Call, feedback, report, pay | Yes | No pre-call lobby or leave sheet. Feedback is a form, not the thanks flow. |
| `/opportunities/retiree` | Yes | Welcome or dashboard tiles. No next-session hero, stats, or segmented tabs. |
| `/retiree/about` | Missing | No programme landing (hero, why join, timeline, FAQ, sticky CTA). |
| `/retiree/apply` | Yes | Steps are named, but no sticky footer, live preview, photo, edit links, or success screen. |
| `/retiree/status` | Yes | Pills exist. No application timeline. |
| `/retiree/checklist` | Yes | Three tasks. No progress ring or celebration beyond a short “You're live”. |
| `/retiree/availability` | Yes | Editor exists. Not the weekly chip rows and hour sheet. |
| Sessions, profile, earnings, notes | Yes | Text pages. Earnings only when paid is on, which stays. |

## §4.1 card states in seed

| State | Persona | Home card |
|---|---|---|
| Not invited | Fahad | Hidden. Correct. |
| Invited, not started | Hassan (opened_at null, no profile) | Generic invite card, not “Learn more” to a landing page. |
| Draft | Mona | “Continue” jumps straight into the wizard. |
| Pending review | Saad | “View status”. |
| Not approved | Huda | “Review and resubmit”. |
| Go-live incomplete | None | Missing from seed. |
| Active | Abdullah, Latifa, and others | “Open” with next session or “No upcoming sessions”. |
| Paused | Turki | “Open”, not “View details”. |

## §0.1 still on screen

- Profile has a shell “‹ Back” and an in-page “Back”.
- Employment dates render as `1988-01-01`.
- Home story tile says “Story”.
- Seeded reviews and next slots repeat.
- Browse and service rows are text boxes.
- Booking has no sticky primary action above the fold.
- Inner screens use the shell back link instead of `AppHeader`.

## Build order

Design system and shell, then home, retiree, seeker, ops polish, seed. Screenshot each section at 390×844 before the next.
