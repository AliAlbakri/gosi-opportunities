import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function configured(name: string) {
  const value = process.env[name]?.trim() ?? "";
  return value.length > 20 && !value.includes("xxxx") && !value.includes("your-service-role");
}

export function hasSupabaseEnv() {
  return configured("NEXT_PUBLIC_SUPABASE_URL") && configured("SUPABASE_SERVICE_ROLE_KEY");
}

export async function databaseReady() {
  const { error } = await admin().from("app_settings").select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message)) return false;
  throw new Error(error.message);
}

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Add the keys to .env.local.");
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function broadcast(topic: string, event: string, payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ messages: [{ topic, event, payload }] }),
    });
  } catch {
    // A missed banner should not roll back the database write.
  }
}
