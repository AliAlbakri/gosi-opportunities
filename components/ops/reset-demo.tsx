"use client";

import { useState, useTransition } from "react";
import { resetDataAction } from "@/app/actions/demo";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

export function ResetDemo({ operatorId }: { operatorId: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4">
      <p className="max-w-xl text-sm text-gosi-midnight-80">{copy.resetInviteBody}</p>
      <Button
        size="md"
        variant="secondary"
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(copy.resetConfirm)) return;
          setMessage(null);
          start(async () => {
            try {
              await resetDataAction(operatorId);
              window.location.reload();
            } catch (error) {
              setMessage(error instanceof Error ? error.message : copy.uploadFailed);
            }
          });
        }}
      >
        {pending ? copy.resetBusy : copy.reset}
      </Button>
      {message && <p className="w-full text-sm">{message}</p>}
    </div>
  );
}
