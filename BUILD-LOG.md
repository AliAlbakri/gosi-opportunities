# Build log

## UX overhaul

- `reference/sawalef/` is not in the repo. No Sawalef patterns are reused. GOSI tokens, icons, and illustrations are the only visual source.
- Entry rule kept from the previous pass and restated by the overhaul: an uninvited retiree sees no Opportunities entry; an invited retiree never sees the seeker catalog.
- `photo_path` is added on `retiree_profiles` for the optional application photo. Avatars stay monograms when it is empty.
- Home entry follows UX-OVERHAUL §3.2: invited retirees get one hero; seekers get a hero and a promo; uninvited retirees get neither.
- Booking is a 4-step flow with an .ics download. Slot-taken returns to the time step.
- Seed: varied weekly hours, unique review texts, Nasser fully booked for 30 days at 09:00, Khaled (ret-extra-5) invited with go-live incomplete.
- Apply migration `supabase/migrations/0003_photo_path.sql` before using photo upload. The column is not required for the current monogram avatars.
