"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AppHeader({
  title,
  onBack,
  action,
  transparent = false,
}: {
  title?: string;
  onBack?: () => void;
  action?: ReactNode;
  transparent?: boolean;
}) {
  const router = useRouter();
  const [solid, setSolid] = useState(!transparent);
  useEffect(() => {
    if (!transparent) return;
    const scroller = document.querySelector("[data-phone-scroll]");
    if (!scroller) return;
    const onScroll = () => setSolid(scroller.scrollTop > 24);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [transparent]);
  const overHero = transparent && !solid;
  return (
    <header className={`sticky top-0 z-20 flex h-14 items-center gap-2 px-3 ${overHero ? "bg-transparent text-white" : "bg-white/95 text-gosi-rich-blue backdrop-blur"}`}>
      <button
        type="button"
        aria-label="Back"
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${overHero ? "bg-white/15" : "bg-gosi-midnight-10"}`}
        onClick={() => (onBack ? onBack() : router.back())}
      >
        <ChevronLeft size={22} strokeWidth={1.75} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-lg font-semibold">{title}</h1>
      <div className="grid h-10 w-10 shrink-0 place-items-center">{action}</div>
    </header>
  );
}
