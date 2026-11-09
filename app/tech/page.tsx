import { TechForm } from "@/components/ops/tech-form";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { futurePaidCount } from "@/lib/domain/pricing";
import { processDueLazy } from "@/lib/domain/jobs";
import { getCategories, getSettings } from "@/lib/domain/settings";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TechPage() {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  await processDueLazy();
  const [settings, categories, count] = await Promise.all([getSettings(), getCategories(), futurePaidCount()]);
  return (
    <main className="min-h-dvh bg-gosi-midnight-10 p-8 text-gosi-rich-blue">
      <h1 className="border-b-2 border-gosi-blue text-3xl">Tech configuration: paid sessions</h1>
      <p className="mt-2">Managed by the tech team. Not available in the ops console.</p>
      <a className="mt-2 inline-block text-sm text-gosi-blue" href="/clock">Demo clock</a>
      <TechForm settings={settings} categories={categories} futurePaid={count} />
    </main>
  );
}
