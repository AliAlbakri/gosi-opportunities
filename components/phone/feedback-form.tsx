"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { feedbackAction } from "@/app/actions/flow";
import { BookingIllustration } from "@/components/illustrations/spots";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";
import { copy } from "@/lib/copy";

const tags = ["clear explanation", "strong knowledge", "well prepared", "unclear", "limited knowledge", "unprepared", "off-topic", "unprofessional"];

export function FeedbackForm({ personaId, bookingId, seekerId, retireeId }: { personaId: string; bookingId: string; seekerId: string; retireeId: string }) {
  const [rating, setRating] = useState(5);
  const [helped, setHelped] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const [pending, start] = useTransition();
  const base = `/phone/${personaId}/opportunities`;
  if (thanks) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center text-gosi-rich-blue">
        <BookingIllustration className="h-28 w-36" />
        <h1 className="text-[22px] font-semibold">{copy.session.thanks}</h1>
        <p className="text-[15px]">{copy.session.thanksBody}</p>
        <Link href={`${base}/p/${retireeId}`} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gosi-rich-blue text-[15px] font-semibold text-white">{copy.seekerUi.bookAgain}</Link>
        <Link href={base} className="text-[15px] font-semibold text-gosi-blue">{copy.session.backOpportunities}</Link>
      </div>
    );
  }
  return (
    <form className="space-y-4 p-5 text-gosi-rich-blue" onSubmit={(event) => {
      event.preventDefault();
      if (helped === null) return;
      start(async () => {
        const result = await feedbackAction({ bookingId, seekerId, rating, helped, tags: picked, review });
        if (!result.ok) setError(result.error);
        else setThanks(true);
      });
    }}>
      <h1 className="text-[22px] font-semibold">{copy.session.howWas}</h1>
      <p className="text-[13px] text-gosi-midnight-50">The retiree sees the average only.</p>
      <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} aria-label={`${n} stars`} className={`h-11 w-11 rounded-full text-[15px] font-semibold ${n <= rating ? "bg-gosi-vivid-green" : "bg-white"}`} onClick={() => setRating(n)}>{n}</button>)}</div>
      <p className="font-semibold">{copy.session.didThisHelp}</p>
      <div className="flex gap-2">
        <button type="button" className={`h-11 flex-1 rounded-full font-semibold ${helped === true ? "bg-gosi-vivid-green" : "bg-white"}`} onClick={() => setHelped(true)}>Yes</button>
        <button type="button" className={`h-11 flex-1 rounded-full font-semibold ${helped === false ? "bg-gosi-vivid-green" : "bg-white"}`} onClick={() => setHelped(false)}>No</button>
      </div>
      <div className="flex flex-wrap gap-2">{tags.map((tag) => <button type="button" key={tag} className={`rounded-full px-3 py-1 text-sm ${picked.includes(tag) ? "bg-gosi-green-10" : "bg-white"}`} onClick={() => setPicked((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tag}</button>)}</div>
      <TextArea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Written review (optional)" />
      {error && <p>{error}</p>}
      <Button disabled={pending || helped === null} type="submit">Send feedback</Button>
    </form>
  );
}
