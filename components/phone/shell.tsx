"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Home, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoButton } from "@/components/shared/demo-toast";
import { useLiveUpdates } from "@/lib/realtime-client";
import { formatClock } from "@/lib/format";

const tabs = [
  { href: "home", label: "Home", icon: Home },
  { href: "contributions", label: "Contributions" },
  { href: "help", label: "Help" },
  { href: "benefits", label: "Benefits" },
  { href: "more", label: "More", icon: MoreHorizontal },
];

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
  const atRoot = pathname.endsWith("/home") || pathname.endsWith("/more") || pathname.endsWith("/notifications");

  return (
    <div className="min-[500px]:grid min-[500px]:min-h-dvh min-[500px]:place-items-center min-[500px]:bg-gosi-midnight-10">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-gosi-midnight-10 min-[500px]:h-[844px] min-[500px]:w-[390px] min-[500px]:rounded-[44px] min-[500px]:border-[10px] min-[500px]:border-black">
        <div className="flex items-center justify-between px-5 pt-3 text-xs font-medium text-gosi-rich-blue">
          <span>{formatClock(new Date(now))}</span>
          <span className="min-[500px]:block hidden h-6 w-24 rounded-full bg-black" />
          <span>5G 100%</span>
        </div>
        {banner && (
          <button
            type="button"
            className="absolute inset-x-3 top-10 z-20 rounded-[20px] bg-white p-3 text-left shadow"
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
        {!atRoot && (
          <button type="button" className="px-4 pt-1 text-left text-sm text-gosi-blue" onClick={() => router.back()}>
            ‹ Back
          </button>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <div className="mx-auto mb-1 h-1 w-28 rounded-full bg-gosi-midnight" />
        {showTabs && (
          <nav className="grid grid-cols-5 border-t border-gosi-midnight-10 bg-white px-1 py-2 text-[10px] text-gosi-midnight-50">
            {tabs.map((tab) => {
              const active = pathname.endsWith(`/${tab.href}`);
              const content = (
                <span className="flex flex-col items-center gap-1">
                  {tab.icon ? <tab.icon size={18} /> : <span className="h-4" />}
                  {tab.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-gosi-vivid-green" />}
                </span>
              );
              if (tab.href === "home" || tab.href === "more") {
                return (
                  <Link key={tab.href} href={`/phone/${personaId}/${tab.href}`} className={active ? "text-gosi-rich-blue" : ""}>
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
    </div>
  );
}
