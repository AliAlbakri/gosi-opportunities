import { getAppNow } from "@/lib/domain/clock";
import { admin, broadcast } from "@/lib/supabase/admin";

export async function notify(personaId: string, input: { title: string; body: string; link?: string | null }) {
  const at = await getAppNow();
  const { error } = await admin().from("notifications").insert({
    persona_id: personaId,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
    created_at: at.toISOString(),
  });
  if (error) throw new Error(error.message);
  await broadcast(`persona:${personaId}`, "notification", {
    title: input.title,
    body: input.body,
    link: input.link ?? null,
  });
}

export async function notifyPerson(personId: string, input: { title: string; body: string; linkFor: (personaId: string) => string }) {
  const { data, error } = await admin().from("personas").select("id").eq("person_id", personId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return;
  await notify(data.id, { title: input.title, body: input.body, link: input.linkFor(data.id) });
}

export async function notifyOperators(input: { title: string; body: string; linkFor: (operatorId: string) => string }) {
  const { data, error } = await admin().from("personas").select("id").eq("kind", "operator");
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    await notify(row.id, { title: input.title, body: input.body, link: input.linkFor(row.id) });
  }
}

export async function listNotifications(personaId: string) {
  const { data, error } = await admin()
    .from("notifications")
    .select("*")
    .eq("persona_id", personaId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function unreadCount(personaId: string) {
  const { count, error } = await admin()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("persona_id", personaId)
    .is("read_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markRead(personaId: string, notificationId: string) {
  const at = await getAppNow();
  await admin()
    .from("notifications")
    .update({ read_at: at.toISOString() })
    .eq("id", notificationId)
    .eq("persona_id", personaId);
}

export async function markAllRead(personaId: string) {
  const at = await getAppNow();
  await admin()
    .from("notifications")
    .update({ read_at: at.toISOString() })
    .eq("persona_id", personaId)
    .is("read_at", null);
}
