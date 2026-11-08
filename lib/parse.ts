import { z } from "zod";

export function parsed<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Check the form and try again." };
  }
  return { ok: true, data: result.data };
}
