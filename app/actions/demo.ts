"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jumpToMonthEnd, jumpToNextBooking, resetClock, shiftClock } from "@/lib/domain/demo-clock";
import { notify } from "@/lib/domain/notifications";
import { parsed } from "@/lib/parse";
import { broadcast } from "@/lib/realtime";
import { seedDemo } from "@/scripts/seed";
import { copy } from "@/lib/copy";

function done() {
  revalidatePath("/", "layout");
}

export async function shiftClockAction(seconds: number) {
  const input = parsed(z.number().int(), seconds);
  if (!input.ok) return input;
  await shiftClock(input.data);
  done();
  return { ok: true as const };
}

export async function resetClockAction() {
  await resetClock();
  done();
  return { ok: true as const };
}

export async function jumpMonthAction() {
  const result = await jumpToMonthEnd();
  done();
  return result;
}

export async function jumpBookingAction() {
  const result = await jumpToNextBooking();
  done();
  return result;
}

export async function resetDataAction() {
  await seedDemo();
  await broadcast("demo", "data.reset", {});
  done();
  return { ok: true as const };
}

export async function testNotificationAction(personaId: string) {
  const input = parsed(z.string().min(1), personaId);
  if (!input.ok) return input;
  await notify(input.data, {
    title: "Test notification",
    body: "This banner is only for the phone you selected.",
    link: `/phone/${input.data}/notifications`,
  });
  done();
  return { ok: true as const };
}

export async function scriptSteps() {
  return copy.script;
}
