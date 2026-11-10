import { audit } from "@/lib/domain/audit";
import { getAppNow } from "@/lib/domain/clock";
import { notify, notifyOperators } from "@/lib/domain/notifications";
import { getInvitation } from "@/lib/domain/invitations";
import { employmentFor, getPerson } from "@/lib/domain/personas";
import { yearsOfEmployment } from "@/lib/domain/rules";
import { getCategories, getServiceTypes } from "@/lib/domain/settings";
import { admin } from "@/lib/supabase/admin";
import type { RetireeProfile, RetireeServiceType } from "@/lib/types";

export async function getProfile(personId: string): Promise<RetireeProfile | null> {
  const { data, error } = await admin().from("retiree_profiles").select("*").eq("person_id", personId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getServiceRows(personId: string): Promise<RetireeServiceType[]> {
  const { data, error } = await admin().from("retiree_service_types").select("*").eq("person_id", personId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...row, price: row.price == null ? null : Number(row.price) }));
}

export async function getDocuments(personId: string) {
  const { data, error } = await admin().from("retiree_documents").select("*").eq("person_id", personId).order("uploaded_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function applicationBundle(personId: string) {
  const [person, jobs, profile, services, documents, categories, serviceTypes, invitation] = await Promise.all([
    getPerson(personId),
    employmentFor(personId),
    getProfile(personId),
    getServiceRows(personId),
    getDocuments(personId),
    getCategories(),
    getServiceTypes(),
    getInvitation(personId),
  ]);
  const appNow = await getAppNow();
  return {
    person,
    jobs,
    years: Math.round(yearsOfEmployment(jobs, appNow)),
    profile,
    services,
    documents,
    categories,
    serviceTypes,
    invitation,
  };
}

async function ensureDraft(personId: string) {
  const existing = await getProfile(personId);
  if (existing) return existing;
  const appNow = await getAppNow();
  const { data, error } = await admin()
    .from("retiree_profiles")
    .insert({
      person_id: personId,
      state: "draft",
      application_step: 1,
      created_at: appNow.toISOString(),
      updated_at: appNow.toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as RetireeProfile;
}

export async function saveApplication(
  personId: string,
  input: {
    step: number;
    showEmployers?: boolean;
    showDates?: boolean;
    showSector?: boolean;
    disciplineRole?: string;
    specializations?: string;
    intro?: string;
    languages?: string[];
    offerings?: { serviceTypeId: string; description: string }[];
  },
) {
  await ensureDraft(personId);
  const appNow = await getAppNow();
  const patch: Record<string, unknown> = {
    application_step: input.step,
    updated_at: appNow.toISOString(),
  };
  if (input.showEmployers !== undefined) patch.show_employers = input.showEmployers;
  if (input.showDates !== undefined) patch.show_dates = input.showDates;
  if (input.showSector !== undefined) patch.show_sector = input.showSector;
  if (input.disciplineRole !== undefined) patch.discipline_role = input.disciplineRole;
  if (input.specializations !== undefined) patch.specializations = input.specializations;
  if (input.intro !== undefined) patch.intro = input.intro;
  if (input.languages !== undefined) patch.languages = input.languages;
  const { error } = await admin().from("retiree_profiles").update(patch).eq("person_id", personId);
  if (error) throw new Error(error.message);
  if (input.offerings) {
    const current = await getServiceRows(personId);
    const keep = new Set(input.offerings.map((row) => row.serviceTypeId));
    for (const row of current) {
      if (row.status === "draft" && !keep.has(row.service_type_id)) {
        await admin().from("retiree_service_types").delete().eq("id", row.id);
      }
    }
    for (const offer of input.offerings) {
      const existing = current.find((row) => row.service_type_id === offer.serviceTypeId);
      if (existing) {
        if (existing.status === "draft" || existing.status === "not_approved") {
          await admin().from("retiree_service_types").update({ description: offer.description }).eq("id", existing.id);
        }
      } else {
        await admin().from("retiree_service_types").insert({
          person_id: personId,
          service_type_id: offer.serviceTypeId,
          description: offer.description,
          status: "draft",
        });
      }
    }
  }
}

const fileTypes: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export async function uploadDocument(personId: string, kind: "cv" | "certificate", file: File) {
  await ensureDraft(personId);
  if (!file || file.size === 0) return { ok: false as const, error: "Choose a file." };
  if (file.size > 10 * 1024 * 1024) return { ok: false as const, error: "Files must be 10 MB or smaller." };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = fileTypes[extension] ?? (file.type === "image/jpg" ? "image/jpeg" : file.type);
  if (!Object.values(fileTypes).includes(contentType)) return { ok: false as const, error: "Upload a PDF, JPG, or PNG file." };
  if (kind === "cv") {
    const docs = await getDocuments(personId);
    const previous = docs.filter((doc) => doc.kind === "cv");
    for (const doc of previous) {
      await admin().storage.from("retiree-docs").remove([doc.file_path]);
      await admin().from("retiree_documents").delete().eq("id", doc.id);
    }
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${personId}/${kind}/${crypto.randomUUID()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: upError } = await admin().storage.from("retiree-docs").upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (upError) return { ok: false as const, error: upError.message };
  const appNow = await getAppNow();
  const { error } = await admin().from("retiree_documents").insert({
    person_id: personId,
    kind,
    file_path: path,
    file_name: file.name,
    uploaded_at: appNow.toISOString(),
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function uploadPhoto(personId: string, file: File) {
  await ensureDraft(personId);
  if (!file || file.size === 0) return { ok: false as const, error: "Choose a photo." };
  if (file.size > 10 * 1024 * 1024) return { ok: false as const, error: "Photos must be 10 MB or smaller." };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = fileTypes[extension] ?? (file.type === "image/jpg" ? "image/jpeg" : file.type);
  if (contentType !== "image/jpeg" && contentType !== "image/png") return { ok: false as const, error: "Use a JPG or PNG photo." };
  const profile = await getProfile(personId);
  if (profile?.photo_path) await admin().storage.from("retiree-docs").remove([profile.photo_path]);
  const path = `${personId}/photo/${crypto.randomUUID()}.${extension || "jpg"}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: upError } = await admin().storage.from("retiree-docs").upload(path, bytes, { contentType, upsert: false });
  if (upError) return { ok: false as const, error: upError.message };
  const { error } = await admin().from("retiree_profiles").update({ photo_path: path }).eq("person_id", personId);
  if (error) return { ok: false as const, error: error.message };
  const url = await signedDocumentUrl(path);
  return { ok: true as const, url };
}

export async function removeDocument(personId: string, documentId: string) {
  const { data } = await admin().from("retiree_documents").select("*").eq("id", documentId).eq("person_id", personId).maybeSingle();
  if (!data) return;
  await admin().storage.from("retiree-docs").remove([data.file_path]);
  await admin().from("retiree_documents").delete().eq("id", documentId);
}

export async function signedDocumentUrl(path: string) {
  const { data, error } = await admin().storage.from("retiree-docs").createSignedUrl(path, 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function operatorDocuments(personId: string) {
  const documents = await getDocuments(personId);
  return Promise.all(
    documents.map(async (doc) => {
      let url = "";
      try {
        url = await signedDocumentUrl(doc.file_path);
      } catch {
        url = "";
      }
      return {
        id: doc.id as string,
        kind: doc.kind as "cv" | "certificate",
        file_name: doc.file_name as string,
        uploaded_at: doc.uploaded_at as string,
        url,
      };
    }),
  );
}

export async function submitApplication(personId: string, personaId: string) {
  const profile = await getProfile(personId);
  const services = await getServiceRows(personId);
  if (!profile) return { ok: false as const, error: "Start your application first." };
  if (!profile.discipline_role?.trim()) return { ok: false as const, error: "Add your professional discipline and role." };
  if (!profile.languages?.length) return { ok: false as const, error: "Choose at least one language." };
  const drafts = services.filter((row) => row.status === "draft" || row.status === "not_approved");
  if (!drafts.length && !services.some((row) => row.status === "pending" || row.status === "approved")) {
    return { ok: false as const, error: "Choose at least one Service Type." };
  }
  for (const row of drafts) {
    const length = row.description.trim().length;
    if (length < 80 || length > 800) {
      return { ok: false as const, error: "Each Service Type needs a description between 80 and 800 characters." };
    }
  }
  const appNow = await getAppNow();
  for (const row of drafts) {
    await admin()
      .from("retiree_service_types")
      .update({ status: "pending", reason_code: null, reason_note: null, decided_at: null, decided_by: null })
      .eq("id", row.id);
  }
  const nextState = services.some((row) => row.status === "approved") ? profile.state : "pending_review";
  await admin()
    .from("retiree_profiles")
    .update({
      state: nextState === "paused" ? "paused" : nextState,
      terms_accepted_at: appNow.toISOString(),
      submitted_at: profile.submitted_at ?? appNow.toISOString(),
      application_step: 5,
      updated_at: appNow.toISOString(),
    })
    .eq("person_id", personId);
  await audit(personaId, "application.submitted", "retiree_profile", personId, {});
  await notify(personaId, {
    title: "Application submitted",
    body: "We've received your application. We'll notify you in the app when there's an update.",
    link: `/phone/${personaId}/opportunities/retiree/status`,
  });
  await notifyOperators({
    title: "New application to review",
    body: "A retiree submitted a GOSI Opportunities application.",
    linkFor: (operatorId) => `/ops/${operatorId}/review/${personId}`,
  });
  return { ok: true as const };
}

export async function resubmit(personId: string, personaId: string, offerings: { id: string; description: string }[]) {
  const profile = await getProfile(personId);
  if (!profile) return { ok: false as const, error: "Application not found." };
  const appNow = await getAppNow();
  for (const offer of offerings) {
    const length = offer.description.trim().length;
    if (length < 80 || length > 800) {
      return { ok: false as const, error: "Each Service Type needs a description between 80 and 800 characters." };
    }
    await admin()
      .from("retiree_service_types")
      .update({
        description: offer.description,
        status: "pending",
        reason_code: null,
        reason_note: null,
        decided_at: null,
        decided_by: null,
      })
      .eq("id", offer.id)
      .eq("person_id", personId)
      .eq("status", "not_approved");
  }
  const services = await getServiceRows(personId);
  const state = services.some((row) => row.status === "approved")
    ? profile.state === "paused"
      ? "paused"
      : "active"
    : "pending_review";
  await admin().from("retiree_profiles").update({ state, updated_at: appNow.toISOString() }).eq("person_id", personId);
  await audit(personaId, "application.resubmitted", "retiree_profile", personId, {});
  await notifyOperators({
    title: "New application to review",
    body: "A retiree resubmitted a Service Type for review.",
    linkFor: (operatorId) => `/ops/${operatorId}/review/${personId}`,
  });
  await notify(personaId, {
    title: "Application submitted",
    body: "Your update is back with the review team.",
    link: `/phone/${personaId}/opportunities/retiree/status`,
  });
  return { ok: true as const };
}

export async function updateLayer2(
  personId: string,
  personaId: string,
  input: { disciplineRole: string; specializations: string; intro: string; languages: string[] },
) {
  if (!input.disciplineRole.trim() || !input.languages.length) {
    return { ok: false as const, error: "Discipline and at least one language are required." };
  }
  const appNow = await getAppNow();
  const { error } = await admin()
    .from("retiree_profiles")
    .update({
      discipline_role: input.disciplineRole,
      specializations: input.specializations,
      intro: input.intro,
      languages: input.languages,
      updated_at: appNow.toISOString(),
    })
    .eq("person_id", personId);
  if (error) return { ok: false as const, error: error.message };
  await audit(personaId, "profile.layer2_edited", "retiree_profile", personId, {});
  return { ok: true as const };
}
