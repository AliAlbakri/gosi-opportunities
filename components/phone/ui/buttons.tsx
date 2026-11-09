"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

const press = "transition active:scale-[0.98] disabled:bg-gosi-midnight-25 disabled:text-gosi-midnight-50";

export function PrimaryButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-gosi-vivid-green px-5 text-[15px] font-semibold text-gosi-rich-blue ${press} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`inline-flex h-[52px] items-center justify-center rounded-full border border-gosi-midnight-25 bg-white px-5 text-[15px] font-semibold text-gosi-rich-blue ${press} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function TextButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`inline-flex h-11 items-center justify-center px-2 text-[15px] font-semibold text-gosi-blue ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ children, label, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} className={`grid h-12 w-12 place-items-center rounded-full bg-white text-gosi-rich-blue ${press} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function StickyFooter({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 z-10 mt-auto border-t border-gosi-midnight-10 bg-white px-5 py-3 pb-5">{children}</div>;
}
