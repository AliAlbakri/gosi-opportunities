import { listWindows } from "@/lib/domain/availability";
import { getAppNow } from "@/lib/domain/clock";
import { checklistDone, DAY_MS, generateSlots, yearsOfEmployment } from "@/lib/domain/rules";
import { getCategories, getServiceTypes, getSettings } from "@/lib/domain/settings";
import { admin } from "@/lib/supabase/admin";
import { formatReviewMonth } from "@/lib/format";
import type { Booking, RetireeProfile, RetireeServiceType } from "@/lib/types";

type Busy = { retiree_id: string; seeker_id: string; starts_at: string; status: string };

export async function catalog() {
  const [categories, serviceTypes, settings] = await Promise.all([getCategories(), getServiceTypes(), getSettings()]);
  return { categories, serviceTypes, paidEnabled: settings.paid_enabled };
}

export async function listRetireeCards(input: {
  q?: string;
  language?: string;
  price?: "any" | "free" | "paid";
  categoryId?: string;
  serviceTypeId?: string;
  sort?: "soonest" | "rating" | "sessions";
  minRating?: number;
  thisWeek?: boolean;
}) {
  const appNow = await getAppNow();
  const settings = await getSettings();
  const [profilesRes, peopleRes, servicesRes, windowsRes, bookingsRes, typesRes, feedbackRes, employmentRes] = await Promise.all([
    admin().from("retiree_profiles").select("*").eq("state", "active").eq("accepting_bookings", true),
    admin().from("gosi_people").select("id, full_name, first_name"),
    admin().from("retiree_service_types").select("*").eq("status", "approved"),
    admin().from("availability_windows").select("*"),
    admin().from("bookings").select("retiree_id, seeker_id, starts_at, status").in("status", ["pending_payment", "confirmed"]),
    getServiceTypes(),
    admin().from("feedback").select("booking_id, rating"),
    admin().from("gosi_employment").select("person_id, start_date, end_date"),
  ]);
  for (const res of [profilesRes, peopleRes, servicesRes, windowsRes, bookingsRes, feedbackRes, employmentRes]) {
    if (res.error) throw new Error(res.error.message);
  }
  const { data: completed } = await admin().from("bookings").select("id, retiree_id").eq("status", "completed");
  const ratingByBooking = new Map((feedbackRes.data ?? []).map((row) => [row.booking_id, row.rating as number]));
  const jobsByPerson = new Map<string, { start_date: string; end_date: string | null }[]>();
  for (const job of employmentRes.data ?? []) {
    const list = jobsByPerson.get(job.person_id) ?? [];
    list.push(job);
    jobsByPerson.set(job.person_id, list);
  }
  const people = new Map((peopleRes.data ?? []).map((row) => [row.id, row]));
  const types = new Map(typesRes.map((row) => [row.id, row]));
  const q = input.q?.trim().toLowerCase() ?? "";
  const cards = [];
  const languages = new Set<string>();
  for (const profile of (profilesRes.data ?? []) as RetireeProfile[]) {
    const windows = (windowsRes.data ?? []).filter((row) => row.person_id === profile.person_id);
    if (!checklistDone(profile, windows.length)) continue;
    const services = ((servicesRes.data ?? []) as RetireeServiceType[]).filter((row) => row.person_id === profile.person_id);
    if (!services.length) continue;
    if (input.serviceTypeId && !services.some((row) => row.service_type_id === input.serviceTypeId)) continue;
    if (input.categoryId && !services.some((row) => types.get(row.service_type_id)?.category_id === input.categoryId)) continue;
    for (const language of profile.languages ?? []) languages.add(language);
    if (input.language && !(profile.languages ?? []).includes(input.language)) continue;
    const person = people.get(profile.person_id);
    const hay = [
      person?.full_name,
      profile.discipline_role,
      profile.intro,
      ...services.map((row) => `${types.get(row.service_type_id)?.name ?? ""} ${row.description}`),
    ]
      .join(" ")
      .toLowerCase();
    if (q && !hay.includes(q)) continue;
    const priced = services.filter((row) => settings.paid_enabled && row.pricing_mode === "paid");
    const freeOnly = services.every((row) => !settings.paid_enabled || row.pricing_mode === "free");
    if (input.price === "paid" && !priced.length) continue;
    if (input.price === "free" && !freeOnly && !services.some((row) => row.pricing_mode === "free" || !settings.paid_enabled)) continue;
    if (input.price === "free" && settings.paid_enabled && services.every((row) => row.pricing_mode === "paid")) continue;
    const rangeStart = new Date(appNow.getTime() + DAY_MS);
    const rangeEnd = new Date(appNow.getTime() + 30 * DAY_MS);
    const busy = new Set(
      ((bookingsRes.data ?? []) as Busy[])
        .filter((row) => row.retiree_id === profile.person_id)
        .map((row) => new Date(row.starts_at).toISOString()),
    );
    const next = generateSlots(windows, rangeStart, rangeEnd).find((slot) => !busy.has(slot.toISOString())) ?? null;
    const done = (completed ?? []).filter((row) => row.retiree_id === profile.person_id);
    const ratings = done.map((row) => ratingByBooking.get(row.id)).filter((n): n is number => typeof n === "number");
    const minPrice = priced.length ? Math.min(...priced.map((row) => Number(row.price))) : null;
    const rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    if (input.minRating && (rating == null || rating < input.minRating)) continue;
    if (input.thisWeek && (!next || next.getTime() > appNow.getTime() + 7 * DAY_MS)) continue;
    const name = person?.full_name ?? "Retiree";
    cards.push({
      personId: profile.person_id,
      name,
      initials: name.split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() ?? "").join(""),
      discipline: profile.discipline_role ?? "",
      languages: profile.languages ?? [],
      years: Math.round(yearsOfEmployment(jobsByPerson.get(profile.person_id) ?? [], appNow)),
      rating,
      sessions: ratings.length,
      next,
      priceLabel: !settings.paid_enabled || minPrice == null ? "Free" : `SAR ${Math.round(minPrice)}`,
      fullyBooked: !next,
      services: services.map((row) => {
        const type = types.get(row.service_type_id);
        return {
          id: row.service_type_id,
          name: type?.name ?? row.service_type_id,
          shortName: type?.short_name ?? type?.name ?? row.service_type_id,
          description: row.description,
          categoryId: type?.category_id ?? "",
          priceLabel: !settings.paid_enabled || row.pricing_mode !== "paid" ? "Free" : `SAR ${Math.round(Number(row.price))}`,
        };
      }),
    });
  }
  cards.sort((a, b) => {
    if (input.sort === "soonest") return (a.next?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.next?.getTime() ?? Number.MAX_SAFE_INTEGER);
    if (input.sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (input.sort === "sessions") return b.sessions - a.sessions;
    return a.name.localeCompare(b.name);
  });
  return { cards, paidEnabled: settings.paid_enabled, languages: [...languages].sort() };
}

export async function publicProfile(personId: string) {
  const appNow = await getAppNow();
  const [{ data: person }, { data: profile }, { data: jobs }, { data: services }, { data: docs }, types, settings, windows] =
    await Promise.all([
      admin().from("gosi_people").select("*").eq("id", personId).maybeSingle(),
      admin().from("retiree_profiles").select("*").eq("person_id", personId).maybeSingle(),
      admin().from("gosi_employment").select("*").eq("person_id", personId).order("start_date"),
      admin().from("retiree_service_types").select("*").eq("person_id", personId).eq("status", "approved"),
      admin().from("retiree_documents").select("file_name, kind").eq("person_id", personId),
      getServiceTypes(),
      getSettings(),
      listWindows(personId),
    ]);
  if (!person || !profile) return null;
  const typeMap = new Map(types.map((row) => [row.id, row]));
  const { data: completed } = await admin().from("bookings").select("id, seeker_id, completed_at").eq("retiree_id", personId).eq("status", "completed");
  const ids = (completed ?? []).map((row) => row.id);
  const { data: feedback } = ids.length
    ? await admin().from("feedback").select("*").in("booking_id", ids)
    : { data: [] };
  const ratings = (feedback ?? []).map((row) => row.rating as number);
  const seekerIds = [...new Set((completed ?? []).map((row) => row.seeker_id))];
  const { data: seekers } = seekerIds.length
    ? await admin().from("gosi_people").select("id, first_name").in("id", seekerIds)
    : { data: [] };
  const seekerName = new Map((seekers ?? []).map((row) => [row.id, row.first_name]));
  const bookingSeeker = new Map((completed ?? []).map((row) => [row.id, row]));
  const reviews = (feedback ?? [])
    .filter((row) => row.review_status !== "rejected" && row.review_text)
    .map((row) => ({
      text: row.review_text as string,
      firstName: seekerName.get(bookingSeeker.get(row.booking_id)?.seeker_id ?? "") ?? "Seeker",
      month: formatReviewMonth(row.created_at),
    }));
  const rangeStart = new Date(appNow.getTime() + DAY_MS);
  const rangeEnd = new Date(appNow.getTime() + 30 * DAY_MS);
  const { data: busyRows } = await admin()
    .from("bookings")
    .select("starts_at")
    .eq("retiree_id", personId)
    .in("status", ["pending_payment", "confirmed"]);
  const busy = new Set((busyRows ?? []).map((row) => new Date(row.starts_at).toISOString()));
  const slots = generateSlots(windows, rangeStart, rangeEnd).filter((slot) => !busy.has(slot.toISOString()));
  return {
    person,
    profile: profile as RetireeProfile,
    jobs: jobs ?? [],
    documents: docs ?? [],
    services: (services ?? []).map((row) => ({
      ...row,
      price: row.price == null ? null : Number(row.price),
      serviceType: typeMap.get(row.service_type_id),
    })),
    rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    sessions: ratings.length,
    reviews,
    slots,
    paidEnabled: settings.paid_enabled,
    listed: profile.state === "active" && profile.accepting_bookings && checklistDone(profile, windows.length),
  };
}

export async function aggregateForRetiree(personId: string) {
  const { data: completed } = await admin().from("bookings").select("id").eq("retiree_id", personId).eq("status", "completed");
  const ids = (completed ?? []).map((row) => row.id);
  if (!ids.length) return { rating: null as number | null, sessions: 0 };
  const { data: feedback } = await admin().from("feedback").select("rating").in("booking_id", ids);
  const ratings = (feedback ?? []).map((row) => row.rating as number);
  if (!ratings.length) return { rating: null, sessions: 0 };
  return { rating: ratings.reduce((a, b) => a + b, 0) / ratings.length, sessions: ratings.length };
}
