"use client";

import { useState, useTransition } from "react";
import { probeDailyAction } from "@/app/actions/health";

export function HealthProbe() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={pending}
        className="rounded-full bg-gosi-rich-blue px-4 py-2 text-white"
        onClick={() => start(async () => {
          const result = await probeDailyAction();
          setMessage(result.ok ? "Test room created and deleted." : result.error);
        })}
      >
        Create test room
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
