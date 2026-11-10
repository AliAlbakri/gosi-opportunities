"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelAction } from "@/app/actions/flow";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { BottomSheet } from "@/components/phone/ui/flow";
import { copy } from "@/lib/copy";

export function CancelButton({
  bookingId,
  personId,
  personaId,
  party,
  late = false,
  paid = false,
  variant = "button",
}: {
  bookingId: string;
  personId: string;
  personaId: string;
  party: "seeker" | "retiree";
  late?: boolean;
  paid?: boolean;
  variant?: "button" | "text";
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        className={variant === "text" ? "h-11 text-[15px] font-semibold text-[#A04A00]" : "h-11 rounded-full border border-gosi-midnight-25 px-4 text-[15px] font-semibold"}
        onClick={() => setOpen(true)}
      >
        {variant === "text" ? copy.seekerUi.cancelBooking : copy.cancel}
      </button>
      <BottomSheet title={copy.seekerUi.cancelBooking} open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3 text-[15px] leading-[22px]">
          <p>{copy.seekerUi.cancelPolicy}</p>
          {late && <p className="font-semibold">{copy.seekerUi.lateWarning}</p>}
          {paid && <p>{copy.seekerUi.paidRefund}</p>}
          <PrimaryButton
            className="w-full"
            disabled={pending}
            onClick={() => start(async () => {
              await cancelAction(bookingId, personId, personaId, party);
              setOpen(false);
              toast(copy.seekerUi.cancelledToast);
              router.push(`/phone/${personaId}/opportunities/bookings`);
              router.refresh();
            })}
          >
            {copy.seekerUi.cancelBooking}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
