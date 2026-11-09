import type { ReactNode } from "react";
import { BrandIcon } from "@/components/phone/brand-icon";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgb(0_18_45/6%)] ${className}`}>{children}</div>;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-gosi-rich-blue">{title}</h2>
      {action}
    </div>
  );
}

const pills: Record<string, string> = {
  Live: "bg-gosi-green-10 text-gosi-rich-blue",
  Approved: "bg-gosi-green-10 text-gosi-rich-blue",
  Free: "bg-gosi-green-10 text-gosi-rich-blue",
  New: "bg-[#F4EEFF] text-gosi-rich-blue",
  Pending: "bg-gosi-midnight-10 text-gosi-rich-blue",
  "Pending review": "bg-gosi-midnight-10 text-gosi-rich-blue",
  Paid: "bg-[#FFF3E6] text-[#A04A00]",
  "Not approved": "border border-gosi-midnight-25 bg-white text-gosi-rich-blue",
  Paused: "bg-gosi-rich-blue/10 text-gosi-rich-blue",
};

export function StatusPill({ children }: { children: string }) {
  return <span className={`inline-flex h-7 items-center rounded-full px-3 text-[13px] font-semibold ${pills[children] ?? "bg-gosi-midnight-10 text-gosi-rich-blue"}`}>{children}</span>;
}

export function VerifiedBadge({ large = false }: { large?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-gosi-blue ${large ? "text-[13px]" : "text-[11px]"}`}>
      <BrandIcon name="security" className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      Verified by GOSI
    </span>
  );
}

export function Avatar({ name, size = 40, src }: { name: string; size?: 40 | 56 | 72 | 96; src?: string | null }) {
  const letters = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  const box = size === 96 ? "h-24 w-24 text-2xl" : size === 72 ? "h-[72px] w-[72px] text-xl" : size === 56 ? "h-14 w-14 text-[15px]" : "h-10 w-10 text-[13px]";
  if (src) return <img src={src} alt="" className={`${box} rounded-full object-cover`} />;
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gosi-rich-blue to-gosi-blue font-semibold text-white ${box}`}>
      {letters || "GO"}
      <img src="/brand/arrow/gosi-arrow-green.svg" alt="" className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white" />
    </span>
  );
}

export function Chip({ children, selected = false, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  const className = `inline-flex h-11 items-center rounded-full px-4 text-[13px] font-semibold ${selected ? "bg-gosi-rich-blue text-white" : "bg-white text-gosi-rich-blue"}`;
  if (!onClick) return <span className={className}>{children}</span>;
  return <button type="button" className={className} onClick={onClick}>{children}</button>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-6 text-center text-gosi-rich-blue">
      <img src="/brand/illustrations/illustration-02.png" alt="" className="mx-auto h-28 w-28 object-contain" />
      <p className="mt-3 text-lg font-semibold">{title}</p>
      <p className="mt-1 text-[15px] text-gosi-midnight-50">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[20px] bg-white ${className}`} />;
}
