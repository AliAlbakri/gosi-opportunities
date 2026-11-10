"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { copy } from "@/lib/copy";
import { deviceKey } from "@/components/phone/session/preview";

export function DeviceReady({ personaId, href }: { personaId: string; href: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => setReady(localStorage.getItem(deviceKey(personaId)) === "1");
    read();
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, [personaId]);
  if (ready) {
    return <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#14804A]"><Check size={16} />{copy.session.ready}</span>;
  }
  return <Link href={href} className="text-[13px] font-semibold text-gosi-blue">{copy.session.testNow}</Link>;
}
