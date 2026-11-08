import { admin } from "@/lib/supabase/admin";
import type { GosiPerson, Persona } from "@/lib/types";

export async function getPersona(id: string): Promise<Persona | null> {
  const { data, error } = await admin().from("personas").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listPersonas(kind?: Persona["kind"]) {
  let query = admin().from("personas").select("*").order("sort");
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Persona[];
}

export async function getPerson(id: string): Promise<GosiPerson | null> {
  const { data, error } = await admin().from("gosi_people").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getPersonByNationalId(nationalId: string) {
  const { data, error } = await admin().from("gosi_people").select("*").eq("national_id", nationalId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as GosiPerson | null;
}

export async function employmentFor(personId: string) {
  const { data, error } = await admin()
    .from("gosi_employment")
    .select("*")
    .eq("person_id", personId)
    .order("start_date");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function requireUser(personaId: string) {
  const persona = await getPersona(personaId);
  if (!persona || persona.kind !== "gosi_user" || !persona.person_id) return null;
  const person = await getPerson(persona.person_id);
  if (!person) return null;
  return { persona, person };
}

export async function requireOperator(operatorId: string) {
  const persona = await getPersona(operatorId);
  if (!persona || persona.kind !== "operator") return null;
  return persona;
}
