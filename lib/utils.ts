import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export function maskNationalId(id: string) {
  if (id.length < 5) return id;
  return `${id.slice(0, 1)}•••••${id.slice(-4)}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
