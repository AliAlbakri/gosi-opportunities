import { NextResponse } from "next/server";
import { logSessionEvent } from "@/lib/domain/sessions";
import { requireUser } from "@/lib/domain/personas";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  const body = (await request.json()) as { personaId?: string; event?: string };
  if (!body.personaId || (body.event !== "joined" && body.event !== "left")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const user = await requireUser(body.personaId);
  if (!user) return NextResponse.json({ ok: false }, { status: 404 });
  const result = await logSessionEvent(bookingId, user.person.id, body.event);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
