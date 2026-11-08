import { admin } from "@/lib/supabase/admin";
import { getAppNow } from "@/lib/domain/clock";

export async function audit(
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  const at = await getAppNow();
  const { error } = await admin().from("audit_log").insert({
    actor,
    action,
    entity,
    entity_id: entityId,
    details,
    at: at.toISOString(),
  });
  if (error) throw new Error(error.message);
}
