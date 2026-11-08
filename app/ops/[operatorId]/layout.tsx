import { notFound } from "next/navigation";
import { OpsShell } from "@/components/ops/shell";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { processDueLazy } from "@/lib/domain/jobs";
import { requireOperator } from "@/lib/domain/personas";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ operatorId: string }> }) {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  const { operatorId } = await params;
  const operator = await requireOperator(operatorId);
  if (!operator) notFound();
  await processDueLazy();
  return <OpsShell operatorId={operatorId} name={operator.display_name}>{children}</OpsShell>;
}
