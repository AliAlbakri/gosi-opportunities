import { SplashFlow } from "@/components/phone/splash";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { admin, databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PhoneEntryPage() {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  const { data } = await admin()
    .from("personas")
    .select("id, display_name, blurb, person_id")
    .eq("kind", "gosi_user")
    .order("sort");
  const ids = (data ?? []).map((row) => row.person_id).filter(Boolean);
  const { data: people } = ids.length
    ? await admin().from("gosi_people").select("id, national_id, first_name").in("id", ids)
    : { data: [] };
  const byId = new Map((people ?? []).map((row) => [row.id, row]));
  const personas = (data ?? []).map((row) => ({
    id: row.id,
    display_name: row.display_name,
    blurb: row.blurb,
    national_id: byId.get(row.person_id)?.national_id ?? "",
  }));
  return <SplashFlow personas={personas} remembered={people?.[0]?.first_name ?? null} />;
}
