import { notFound } from "next/navigation";
import { DeviceCheck } from "@/components/phone/session/device-check";
import { requireUser } from "@/lib/domain/personas";

export default async function DevicesPage({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  const user = await requireUser(personaId);
  if (!user) notFound();
  return <DeviceCheck personaId={personaId} />;
}
