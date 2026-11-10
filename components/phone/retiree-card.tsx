import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { Avatar, StatusPill } from "@/components/phone/ui/bits";
import { copy } from "@/lib/copy";
import { relativeDay } from "@/lib/format";

function nextLabel(next: string | null, appNow: Date) {
  if (!next) return copy.seekerUi.fullyBooked;
  return relativeDay(next, appNow).replace(", ", " ");
}

function Rating({ rating, sessions }: { rating: number | null; sessions: number }) {
  if (rating == null) return <StatusPill tone="New">{copy.seekerUi.newPill}</StatusPill>;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#00BF00]">
      <Star size={14} fill="#00BF00" strokeWidth={0} />
      {rating.toFixed(1)} ({sessions})
    </span>
  );
}

function SlotChip({ next, appNow }: { next: string | null; appNow: Date }) {
  const open = Boolean(next);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${open ? "bg-gosi-green-10 text-gosi-rich-blue" : "bg-gosi-midnight-10 text-gosi-midnight-50"}`}>
      {open && <Clock size={12} strokeWidth={1.75} />}
      {nextLabel(next, appNow)}
    </span>
  );
}

export function RetireeCard({
  href,
  name,
  discipline,
  years,
  rating,
  sessions,
  price,
  next,
  appNow,
  description,
  variant = "compact",
}: {
  href: string;
  name: string;
  discipline: string;
  years?: number;
  rating: number | null;
  sessions: number;
  price: string;
  next: string | null;
  appNow: Date;
  description?: string | null;
  variant?: "compact" | "row";
}) {
  if (variant === "row") {
    return (
      <Link href={href} className="block rounded-[20px] bg-white p-4 text-gosi-rich-blue shadow-[0_1px_2px_rgb(0_18_45/6%)]">
        <div className="flex gap-3">
          <Avatar name={name} size={56} verified />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[15px] font-semibold">{name}</p>
              <Rating rating={rating} sessions={sessions} />
            </div>
            <p className="truncate text-[13px] text-gosi-midnight-50">{discipline}{years ? ` · ${years} yrs experience` : ""}</p>
            {description && <p className="mt-1 line-clamp-2 text-[13px] leading-[18px] text-gosi-midnight-50">{description}</p>}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[15px] font-semibold">{price}</span>
          <SlotChip next={next} appNow={appNow} />
        </div>
      </Link>
    );
  }
  return (
    <Link href={href} className="block w-[168px] shrink-0 snap-start rounded-[20px] bg-white p-3 text-gosi-rich-blue shadow-[0_1px_2px_rgb(0_18_45/6%)]">
      <Avatar name={name} size={56} verified />
      <p className="mt-2 truncate text-[15px] font-semibold">{name}</p>
      <p className="truncate text-[13px] text-gosi-midnight-50">{discipline}</p>
      <div className="mt-2"><Rating rating={rating} sessions={sessions} /></div>
      <div className="mt-2"><SlotChip next={next} appNow={appNow} /></div>
    </Link>
  );
}
