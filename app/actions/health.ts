"use server";

import { probeDailyRoom } from "@/lib/daily";

export async function probeDailyAction() {
  return probeDailyRoom();
}
