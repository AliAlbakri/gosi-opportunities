import { admin } from "@/lib/supabase/admin";
import type { Booking } from "@/lib/types";

export async function decorateBookings(bookings: Booking[]) {
  if (!bookings.length) return [];
  const personIds = [...new Set(bookings.flatMap((row) => [row.seeker_id, row.retiree_id]))];
  const rstIds = [...new Set(bookings.map((row) => row.retiree_service_type_id))];
  const [{ data: people }, { data: rsts }, { data: types }, { data: feedback }] = await Promise.all([
    admin().from("gosi_people").select("id, full_name, first_name").in("id", personIds),
    admin().from("retiree_service_types").select("id, service_type_id").in("id", rstIds),
    admin().from("service_types").select("id, name, short_name"),
    admin().from("feedback").select("booking_id, rating").in("booking_id", bookings.map((row) => row.id)),
  ]);
  const personName = new Map((people ?? []).map((row) => [row.id, row.full_name as string]));
  const firstName = new Map((people ?? []).map((row) => [row.id, row.first_name as string]));
  const typeByRst = new Map((rsts ?? []).map((row) => [row.id, row.service_type_id as string]));
  const typeName = new Map((types ?? []).map((row) => [row.id, row.name as string]));
  const typeShort = new Map((types ?? []).map((row) => [row.id, (row.short_name as string) || (row.name as string)]));
  const rated = new Map((feedback ?? []).map((row) => [row.booking_id, row.rating as number]));
  return bookings.map((booking) => ({
    ...booking,
    seekerName: firstName.get(booking.seeker_id) ?? "Seeker",
    retireeName: personName.get(booking.retiree_id) ?? "Retiree",
    serviceName: typeName.get(typeByRst.get(booking.retiree_service_type_id) ?? "") ?? "Session",
    serviceShort: typeShort.get(typeByRst.get(booking.retiree_service_type_id) ?? "") ?? "Session",
    rated: rated.has(booking.id),
    rating: rated.get(booking.id) ?? null,
  }));
}
