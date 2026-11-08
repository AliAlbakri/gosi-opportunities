"use client";

import { toast } from "sonner";
import { copy } from "@/lib/copy";

export function demoToast() {
  toast(copy.notInDemo);
}

export function DemoButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={demoToast} className={className}>
      {children}
    </button>
  );
}
