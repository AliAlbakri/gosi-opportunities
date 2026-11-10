"use client";

import { User } from "lucide-react";
import { useState } from "react";

export function AvatarPhoto({ src, className }: { src: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`grid place-items-center rounded-full bg-gosi-midnight-10 text-gosi-rich-blue ${className}`}>
        <User size={18} strokeWidth={1.75} />
      </span>
    );
  }
  return <img src={src} alt="" className={`rounded-full object-cover ${className}`} onError={() => setFailed(true)} />;
}
