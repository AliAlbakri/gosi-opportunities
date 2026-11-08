import { redirect } from "next/navigation";

export default async function SessionsAlias({ params }: { params: Promise<{ personaId: string }> }) {
  const { personaId } = await params;
  redirect(`/phone/${personaId}/opportunities/bookings`);
}
