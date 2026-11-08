import { notFound } from "next/navigation";
import { PhoneShell } from "@/components/phone/shell";
import { SchemaScreen, SetupScreen } from "@/components/setup-screen";
import { getClockOffset } from "@/lib/domain/clock";
import { processDueLazy } from "@/lib/domain/jobs";
import { unreadCount } from "@/lib/domain/notifications";
import { requireUser } from "@/lib/domain/personas";
import { databaseReady, hasSupabaseEnv } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PhoneLayout({ children, params }: { children: React.ReactNode; params: Promise<{ personaId: string }> }) {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  if (!(await databaseReady())) return <SchemaScreen />;
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  await processDueLazy();
  const [offset, unread] = await Promise.all([getClockOffset(), unreadCount(personaId)]);
  return (
    <PhoneShell personaId={personaId} offset={offset} unread={unread}>
      {children}
    </PhoneShell>
  );
}
