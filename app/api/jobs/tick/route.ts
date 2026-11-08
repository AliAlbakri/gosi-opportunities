import { NextResponse } from "next/server";
import { processDue } from "@/lib/domain/jobs";

export async function POST(request: Request) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await processDue();
  return NextResponse.json({ ok: true });
}
