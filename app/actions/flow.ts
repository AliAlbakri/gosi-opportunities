"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { removeDocument, resubmit, saveApplication, submitApplication, updateLayer2, uploadDocument, uploadPhoto } from "@/lib/domain/applications";
import { markOnboardingWatched, markReadiness, replaceWindows, setAcceptingBookings } from "@/lib/domain/availability";
import { cancelBooking, createBooking, expireHold, payBooking } from "@/lib/domain/bookings";
import { saveFeedback } from "@/lib/domain/feedback";
import { previewWave, inviteOne, lookupForInvite, sendWave } from "@/lib/domain/invitations";
import { markAllRead, markRead } from "@/lib/domain/notifications";
import { closeComplaint, decideDispute, fileReport } from "@/lib/domain/reports";
import { decideServiceType } from "@/lib/domain/review";
import { pauseRetiree, restoreRetiree, sendNote } from "@/lib/domain/ops";
import { setServicePrice, switchPaidOff } from "@/lib/domain/pricing";
import { saveTechSettings } from "@/lib/domain/settings";
import { runSettlement } from "@/lib/domain/settlement";
import { testCall } from "@/lib/domain/sessions";
import { joinSession } from "@/lib/domain/sessions";
import { copy } from "@/lib/copy";
import { parsed } from "@/lib/parse";
import { LANGUAGES, REPORT_REASONS } from "@/lib/types";

function done() {
  revalidatePath("/", "layout");
}

const waveSchema = z.object({
  operatorId: z.string().min(1),
  name: z.string().min(2, "Name the wave."),
  sizeCap: z.coerce.number().int().positive(),
  pensionSystems: z.array(z.enum(["public", "private", "combined"])),
  sectors: z.array(z.string()),
  regions: z.array(z.string()),
  minYears: z.coerce.number().min(0),
});

export async function previewWaveAction(input: unknown) {
  const parsedInput = parsed(waveSchema.omit({ operatorId: true, name: true }), input);
  if (!parsedInput.ok) return parsedInput;
  const preview = await previewWave(parsedInput.data, parsedInput.data.sizeCap);
  return { ok: true as const, preview };
}

export async function sendWaveAction(input: unknown) {
  const parsedInput = parsed(waveSchema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await sendWave({
    name: parsedInput.data.name,
    sizeCap: parsedInput.data.sizeCap,
    operatorId: parsedInput.data.operatorId,
    filters: parsedInput.data,
  });
  if (!result.sent) return { ok: false as const, error: copy.waveNone };
  done();
  return { ok: true as const, sent: result.sent };
}

export async function lookupInviteAction(nationalId: string) {
  const parsedInput = parsed(z.object({ nationalId: z.string().regex(/^\d{10}$/, "Enter a 10-digit National ID.") }), { nationalId });
  if (!parsedInput.ok) return parsedInput;
  const found = await lookupForInvite(parsedInput.data.nationalId);
  if ("error" in found && found.error) return { ok: false as const, error: found.error };
  if (!("person" in found) || !found.person) return { ok: false as const, error: "No GOSI record matches that National ID." };
  const sector = found.jobs[0]?.sector ?? "";
  return { ok: true as const, name: found.person.full_name, region: found.person.region, pension: found.person.pension_system, sector };
}

export async function inviteOneAction(operatorId: string, nationalId: string) {
  const parsedInput = parsed(z.object({ operatorId: z.string(), nationalId: z.string().regex(/^\d{10}$/, "Enter a 10-digit National ID.") }), { operatorId, nationalId });
  if (!parsedInput.ok) return parsedInput;
  const result = await inviteOne(parsedInput.data.nationalId, parsedInput.data.operatorId);
  done();
  return result;
}

export async function saveDraftAction(personId: string, input: unknown) {
  const schema = z.object({
    step: z.number().int().min(1).max(5),
    showEmployers: z.boolean().optional(),
    showDates: z.boolean().optional(),
    showSector: z.boolean().optional(),
    disciplineRole: z.string().optional(),
    specializations: z.string().optional(),
    intro: z.string().optional(),
    languages: z.array(z.string()).optional(),
    offerings: z.array(z.object({ serviceTypeId: z.string(), description: z.string() })).optional(),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  await saveApplication(personId, parsedInput.data);
  done();
  return { ok: true as const };
}

export async function uploadAction(personId: string, kind: "cv" | "certificate", formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "Choose a file." };
  const result = await uploadDocument(personId, kind, file);
  done();
  return result;
}

export async function uploadPhotoAction(personId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Choose a photo." };
  const result = await uploadPhoto(personId, file);
  done();
  return result;
}

export async function removeDocAction(personId: string, documentId: string) {
  await removeDocument(personId, documentId);
  done();
  return { ok: true as const };
}

export async function submitAction(personId: string, personaId: string) {
  const result = await submitApplication(personId, personaId);
  done();
  return result;
}

export async function resubmitAction(personId: string, personaId: string, offerings: { id: string; description: string }[]) {
  const result = await resubmit(personId, personaId, offerings);
  done();
  return result;
}

export async function decideAction(input: unknown) {
  const schema = z.object({
    operatorId: z.string(),
    rstId: z.string(),
    decision: z.enum(["approved", "not_approved"]),
    reasonCode: z.enum(["NOT_MATCHING", "INSUFFICIENT_EVIDENCE", "DOCS_UNCLEAR", "CONTENT_ISSUE", "OTHER"]).optional(),
    reasonNote: z.string().optional(),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await decideServiceType(parsedInput.data);
  done();
  return result;
}

export async function watchAction(personId: string, personaId: string) {
  await markOnboardingWatched(personId, personaId);
  done();
  return { ok: true as const };
}

export async function readinessAction(personId: string, personaId: string) {
  await markReadiness(personId, personaId);
  done();
  return { ok: true as const };
}

export async function windowsAction(personId: string, personaId: string, windows: { weekday: number; start: string; end: string }[]) {
  const result = await replaceWindows(personId, personaId, windows);
  done();
  return result;
}

export async function acceptingAction(personId: string, personaId: string, accepting: boolean) {
  const result = await setAcceptingBookings(personId, personaId, accepting);
  done();
  return result;
}

export async function layer2Action(personId: string, personaId: string, input: unknown) {
  const schema = z.object({
    disciplineRole: z.string().min(2),
    specializations: z.string(),
    intro: z.string(),
    languages: z.array(z.enum(LANGUAGES)).min(1),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await updateLayer2(personId, personaId, parsedInput.data);
  done();
  return result;
}

export async function bookAction(input: unknown) {
  const schema = z.object({
    personaId: z.string(),
    seekerId: z.string(),
    birthDate: z.string(),
    retireeId: z.string(),
    retireeServiceTypeId: z.string(),
    startsAt: z.string(),
    need: z.string().min(1),
    goal: z.string().min(1),
    terms: z.literal(true, { message: "Agree to the terms to continue." }),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await createBooking(parsedInput.data);
  done();
  return result;
}

export async function payAction(bookingId: string, seekerId: string, method: "mada" | "apple_pay" | "card", success: boolean) {
  const result = await payBooking(bookingId, seekerId, method, success);
  done();
  return result;
}

export async function expireAction(bookingId: string) {
  await expireHold(bookingId);
  done();
  return { ok: true as const };
}

export async function cancelAction(bookingId: string, personId: string, personaId: string, party: "seeker" | "retiree") {
  const result = await cancelBooking({ bookingId, personId, personaId, party });
  done();
  return result;
}

export async function feedbackAction(input: unknown) {
  const schema = z.object({
    bookingId: z.string(),
    seekerId: z.string(),
    rating: z.coerce.number().int().min(1).max(5),
    helped: z.boolean(),
    tags: z.array(z.string()),
    review: z.string(),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await saveFeedback(parsedInput.data);
  done();
  return result;
}

export async function reportAction(input: unknown) {
  const schema = z.object({
    bookingId: z.string(),
    reporterId: z.string(),
    reason: z.enum(REPORT_REASONS),
    description: z.string().min(1),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await fileReport(parsedInput.data);
  done();
  return result;
}

export async function joinAction(bookingId: string, personId: string, name: string) {
  return joinSession(bookingId, personId, name);
}

export async function testCallAction(personaId: string, name: string) {
  return testCall(personaId, name);
}

export async function pauseAction(operatorId: string, personId: string, reason: string) {
  const result = await pauseRetiree(operatorId, personId, reason);
  done();
  return result;
}

export async function restoreAction(operatorId: string, personId: string) {
  const result = await restoreRetiree(operatorId, personId);
  done();
  return result;
}

export async function noteAction(operatorId: string, personId: string, templateId: string, body: string) {
  const result = await sendNote(operatorId, personId, templateId, body);
  done();
  return result;
}

export async function disputeAction(input: unknown) {
  const schema = z.object({
    operatorId: z.string(),
    reportId: z.string(),
    uphold: z.boolean(),
    note: z.string().min(1),
  });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  const result = await decideDispute(parsedInput.data);
  done();
  return result;
}

export async function closeComplaintAction(operatorId: string, reportId: string, note: string) {
  const result = await closeComplaint(operatorId, reportId, note);
  done();
  return result;
}

export async function techAction(input: unknown) {
  const schema = z.object({
    paidEnabled: z.boolean(),
    floor: z.coerce.number().positive(),
    ceiling: z.coerce.number().positive(),
    suggested: z.record(z.string(), z.coerce.number()),
  }).refine((value) => value.floor < value.ceiling, { message: "The floor must be below the ceiling." });
  const parsedInput = parsed(schema, input);
  if (!parsedInput.ok) return parsedInput;
  for (const price of Object.values(parsedInput.data.suggested)) {
    if (price < parsedInput.data.floor || price > parsedInput.data.ceiling) {
      return { ok: false as const, error: "Each suggested price must sit inside the band." };
    }
  }
  if (!parsedInput.data.paidEnabled) {
    await switchPaidOff();
  }
  await saveTechSettings(parsedInput.data);
  done();
  return { ok: true as const };
}

export async function priceAction(personId: string, personaId: string, rstId: string, mode: "free" | "paid", price: number | null) {
  const result = await setServicePrice(personId, personaId, rstId, mode, price);
  done();
  return result;
}

export async function settleAction(period: string, actor: string) {
  const result = await runSettlement(period, actor);
  done();
  return { ok: true as const, ...result };
}

export async function readAction(personaId: string, notificationId?: string) {
  if (notificationId) await markRead(personaId, notificationId);
  else await markAllRead(personaId);
  done();
  return { ok: true as const };
}
