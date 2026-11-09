import Link from "next/link";
import { Avatar, StatusPill, VerifiedBadge } from "@/components/phone/ui/bits";
import { relativeDay } from "@/lib/format";

export function RetireeCard({
  href,
  name,
  discipline,
  languages,
  rating,
  sessions,
  price,
  next,
  appNow,
}: {
  href: string;
  name: string;
  discipline: string;
  languages: string[];
  rating: number | null;
  sessions: number;
  price: string;
  next: string | null;
  appNow: Date;
}) {
  return (
    <Link href={href} className="block rounded-[20px] bg-white p-4 text-gosi-rich-blue shadow-[0_1px_2px_rgb(0_18_45/6%)]">
      <div className="flex gap-3">
        <Avatar name={name} size={56} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{name}</p>
          <VerifiedBadge />
          <p className="truncate text-[13px] text-gosi-midnight-50">{discipline}</p>
          <p className="text-[13px] text-gosi-midnight-50">{languages.join(", ")}</p>
        </div>
      </div>
      <div className="mt-3">{rating ? <p className="text-[15px] font-semibold">{rating.toFixed(1)} · {sessions} sessions</p> : <StatusPill>New</StatusPill>}</div>
      <div className="mt-3 flex items-center justify-between border-t border-gosi-midnight-10 pt-3 text-[15px]">
        <span className="font-semibold">{price}</span>
        <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${next ? "bg-gosi-green-10" : "bg-gosi-midnight-10 text-gosi-midnight-50"}`}>{next ? relativeDay(next, appNow) : "Fully booked for now"}</span>
      </div>
    </Link>
  );
}
