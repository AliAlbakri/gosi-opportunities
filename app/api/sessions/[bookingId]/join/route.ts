import { NextResponse } from "next/server";
import { joinSession } from "@/lib/domain/sessions";
import { requireUser } from "@/lib/domain/personas";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { personaId?: string };
  if (!body.personaId) return NextResponse.json({ ok: false, code: "NOT_PARTICIPANT", error: "This session is not yours." }, { status: 400 });
  const user = await requireUser(body.personaId);
  if (!user) return NextResponse.json({ ok: false, code: "NOT_PARTICIPANT", error: "This session is not yours." }, { status: 403 });
  const result = await joinSession(bookingId, user.person.id, user.person.first_name);
  const status = result.ok ? 200 : result.code === "NOT_PARTICIPANT" ? 403 : result.code === "NOT_FOUND" ? 404 : 409;
  return NextResponse.json(result, { status });
}
