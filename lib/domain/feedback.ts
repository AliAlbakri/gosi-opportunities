import { getAppNow } from "@/lib/domain/clock";
import { admin } from "@/lib/supabase/admin";

export async function saveFeedback(input: {
  bookingId: string;
  seekerId: string;
  rating: number;
  helped: boolean;
  tags: string[];
  review: string;
}) {
  const { data: booking, error } = await admin().from("bookings").select("*").eq("id", input.bookingId).single();
  if (error) return { ok: false as const, error: error.message };
  if (booking.seeker_id !== input.seekerId) return { ok: false as const, error: "This session is not yours." };
  if (booking.status !== "completed") return { ok: false as const, error: "You can rate a session after it is completed." };
  const { data: existing } = await admin().from("feedback").select("booking_id").eq("booking_id", input.bookingId).maybeSingle();
  if (existing) return { ok: false as const, error: "You have already rated this session." };
  const appNow = await getAppNow();
  const review = input.review.trim();
  const { error: insertError } = await admin().from("feedback").insert({
    booking_id: input.bookingId,
    rating: input.rating,
    helped: input.helped,
    tags: input.tags,
    review_text: review || null,
    review_status: review ? "approved" : null,
    created_at: appNow.toISOString(),
  });
  if (insertError) return { ok: false as const, error: insertError.message };
  return { ok: true as const };
}

export async function feedbackFor(bookingId: string) {
  const { data, error } = await admin().from("feedback").select("*").eq("booking_id", bookingId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
