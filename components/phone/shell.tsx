"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleHelp, MoreHorizontal, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoButton } from "@/components/shared/demo-toast";
import { BrandIcon } from "@/components/phone/brand-icon";
import { IphoneFrame } from "@/components/phone/iphone-frame";
import { useLiveUpdates } from "@/lib/realtime-client";
import { formatClock } from "@/lib/format";

// Contributions, Help, and More have no official GOSI icon. Lucide is the substitute.
const tabs = [
  { href: "home", label: "Home", icon: "home" },
  { href: "contributions", label: "Contributions", substitute: Wallet },
  { href: "help", label: "Help", substitute: CircleHelp },
  { href: "benefits", label: "Benefits", icon: "benefits" },
  { href: "more", label: "More", substitute: MoreHorizontal },
] as const;

export function PhoneShell({
  personaId,
  offset,
  unread,
  children,
}: {
  personaId: string;
  offset: number;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { banner } = useLiveUpdates(personaId);
  const [now, setNow] = useState(() => Date.now() + offset * 1000);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + offset * 1000), 1000);
    return () => clearInterval(timer);
  }, [offset]);
  const showTabs = ["/home", "/more", "/notifications"].some((part) => pathname.endsWith(part));

  return (
    <IphoneFrame responsive>
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-gosi-midnight-10">
        <div className="relative flex items-center justify-between px-6 pb-1 pt-3 text-[13px] font-semibold text-gosi-rich-blue">
          <span className="w-14">{formatClock(new Date(now))}</span>
          <span className="absolute left-1/2 top-2 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
          <span className="flex w-16 items-center justify-end gap-1" aria-hidden>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="0" y="6" width="2" height="4" rx="0.5" /><rect x="3" y="4" width="2" height="6" rx="0.5" /><rect x="6" y="2" width="2" height="8" rx="0.5" /><rect x="9" y="0" width="2" height="10" rx="0.5" /></svg>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4a7 7 0 0 1 11 0M3.2 6.2a4 4 0 0 1 6.6 0" /><circle cx="6.5" cy="8.4" r="0.8" fill="currentColor" stroke="none" /></svg>
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.6" y="0.6" width="18" height="8.8" rx="2" /><rect x="2" y="2" width="12" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="19.2" y="3" width="2" height="4" rx="0.6" fill="currentColor" stroke="none" /></svg>
          </span>
        </div>
        {banner && (
          <button
            type="button"
            className="absolute inset-x-3 top-12 z-20 rounded-[20px] bg-white p-3 text-left shadow"
            onClick={() => banner.link && router.push(banner.link)}
          >
            <div className="flex gap-2">
              <img src="/brand/logo/gosi-wordmark-color.svg" alt="" className="h-4" />
              <div>
                <p className="text-xs text-gosi-midnight-50">GOSI · now</p>
                <p className="text-sm font-medium">{banner.title}</p>
                <p className="text-xs text-gosi-midnight-80">{banner.body}</p>
              </div>
            </div>
          </button>
        )}
        <div data-phone-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex justify-center" aria-hidden>
          <div className="h-1 w-28 rounded-full bg-gosi-midnight/70" />
        </div>
        {showTabs && (
          <nav className="grid grid-cols-5 border-t border-gosi-midnight-10 bg-white px-1 pb-4 pt-2 text-[11px] text-gosi-midnight-50">
            {tabs.map((tab) => {
              const active = pathname.endsWith(`/${tab.href}`);
              const content = (
                <span className={`flex flex-col items-center gap-1 ${active ? "text-gosi-rich-blue" : ""}`}>
                  {"icon" in tab ? (
                    <BrandIcon name={tab.icon} className={`h-5 w-5 ${active ? "" : "opacity-40"}`} />
                  ) : (
                    <tab.substitute size={18} />
                  )}
                  {tab.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-gosi-vivid-green" />}
                </span>
              );
              if (tab.href === "home" || tab.href === "more") {
                return (
                  <Link key={tab.href} href={`/phone/${personaId}/${tab.href}`}>
                    {content}
                  </Link>
                );
              }
              return (
                <DemoButton key={tab.href} className="text-gosi-midnight-50">
                  {content}
                </DemoButton>
              );
            })}
          </nav>
        )}
        {unread > 0 && pathname.endsWith("/home") ? null : null}
      </div>
    </IphoneFrame>
  );
}
