"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { feedbackAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";

const tags = ["clear explanation", "strong knowledge", "well prepared", "unclear", "limited knowledge", "unprepared", "off-topic", "unprofessional"];

export function FeedbackForm({ personaId, bookingId, seekerId }: { personaId: string; bookingId: string; seekerId: string }) {
  const [rating, setRating] = useState(5);
  const [helped, setHelped] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form className="space-y-3 p-4 text-gosi-rich-blue" onSubmit={(event) => {
      event.preventDefault();
      start(async () => {
        const result = await feedbackAction({ bookingId, seekerId, rating, helped, tags: picked, review });
        if (!result.ok) setError(result.error);
        else router.push(`/phone/${personaId}/opportunities/bookings/${bookingId}`);
      });
    }}>
      <h1 className="text-2xl font-medium">How was your session?</h1>
      <p className="text-sm">The retiree sees the average only.</p>
      <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={`h-10 w-10 rounded-full ${n <= rating ? "bg-gosi-vivid-green" : "bg-white"}`} onClick={() => setRating(n)}>{n}</button>)}</div>
      <div className="flex gap-2"><button type="button" onClick={() => setHelped(true)}>Yes</button><button type="button" onClick={() => setHelped(false)}>No</button></div>
      <div className="flex flex-wrap gap-2">{tags.map((tag) => <button type="button" key={tag} className={`rounded-full px-3 py-1 text-sm ${picked.includes(tag) ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setPicked((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tag}</button>)}</div>
      <TextArea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Written review (optional)" />
      {error && <p>{error}</p>}
      <Button disabled={pending} type="submit">Send feedback</Button>
    </form>
  );
}
