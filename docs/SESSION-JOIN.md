# Session join

The phase model in `lib/domain/sessionPhase.ts` is the only clock for Join. App time is real time plus `demo_clock_offset_seconds`. Daily tokens use real time and never set `nbf`.

## Phases

`T` is the scheduled start, in Asia/Riyadh.

| Phase | When | Join | Cancel |
|---|---|---|---|
| upcoming | more than 24h before T | locked, with the opening time | allowed |
| soon | 24h until 10 min before | locked, with a countdown | allowed; under 3h is late |
| open | 10 min before T until T | Join now | allowed, late |
| live | T until T+60 | Join now or Rejoin | not allowed |
| overtime | T+60 until T+90, booking still confirmed | Rejoin | not allowed |
| closed, missed, cancelled, completed | after the window, or from the booking status | none | none |

## Booking detail

Header title is "Your session". The status card follows the phase. Seeker detail includes the retiree, the details rows, Get ready, notes, and Good to know. Retiree detail leads with "Prepare for {name}" and the seeker's need and goal. Cancel stays in the footer until the session is live.

## Join

`POST /api/sessions/[bookingId]/join` checks the persona and the phase in app time, creates the Daily room if it is missing or expired, and returns a token whose expiry is real now plus 3 hours. The lobby asks for that token only when Join session is pressed.
