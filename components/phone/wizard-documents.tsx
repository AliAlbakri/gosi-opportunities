"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BrandIcon } from "@/components/phone/brand-icon";
import { removeDocAction, uploadAction } from "@/app/actions/flow";
import { StepHeading, useFilePicker } from "@/components/phone/wizard-layout";
import { copy } from "@/lib/copy";

type Doc = { id: string; kind: string; file_name: string };

function sizeLabel(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsStep({
  personId,
  files,
  sizes,
  onDone,
}: {
  personId: string;
  files: Doc[];
  sizes: Record<string, number>;
  onDone: (name: string, size: number) => void;
}) {
  const [progress, setProgress] = useState<{ kind: string; name: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(kind: "cv" | "certificate", file: File) {
    setError(null);
    setProgress({ kind, name: file.name, pct: 12 });
    const timer = window.setInterval(() => setProgress((current) => current && current.name === file.name ? { ...current, pct: Math.min(90, current.pct + 8) } : current), 200);
    const data = new FormData();
    data.set("file", file);
    try {
      const result = await uploadAction(personId, kind, data);
      if (!result.ok) setError(result.error);
      else onDone(file.name, file.size);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.uploadFailed);
    } finally {
      window.clearInterval(timer);
      setProgress(null);
    }
  }

  const cv = useFilePicker(".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg", false, (chosen) => void send("cv", chosen[0]));
  const certificates = useFilePicker(".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg", true, (chosen) => { for (const file of chosen) void send("certificate", file); });
  const rows = (kind: string) => files.filter((file) => file.kind === kind);

  return (
    <div className="space-y-6">
      {cv.input}
      {certificates.input}
      <StepHeading title={copy.wizard.documentsTitle} subtitle={copy.wizard.documentsSubtitle} />
      <UploadTile label={copy.wizard.addCv} onClick={cv.open} />
      {progress?.kind === "cv" && <FileRow name={progress.name} progress={progress.pct} />}
      {rows("cv").map((file) => (
        <FileRow key={file.id} name={file.file_name} size={sizes[file.file_name]} onRemove={() => void removeDocAction(personId, file.id).then(() => onDone(file.file_name, sizes[file.file_name] ?? 0))} />
      ))}
      <UploadTile label={copy.wizard.addCertificates} onClick={certificates.open} />
      {progress?.kind === "certificate" && <FileRow name={progress.name} progress={progress.pct} />}
      {rows("certificate").map((file) => (
        <FileRow key={file.id} name={file.file_name} size={sizes[file.file_name]} onRemove={() => void removeDocAction(personId, file.id).then(() => onDone(file.file_name, sizes[file.file_name] ?? 0))} />
      ))}
      {error && <p className="text-[13px] text-gosi-midnight-50">{error}</p>}
    </div>
  );
}

function UploadTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-gosi-midnight-25 bg-white px-4 py-6 text-center" onClick={onClick}>
      <BrandIcon name="certified-document" className="h-8 w-8" />
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="text-[13px] text-gosi-midnight-50">{copy.wizard.fileHint}</span>
    </button>
  );
}

function FileRow({ name, size, progress, onRemove }: { name: string; size?: number; progress?: number; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
      <BrandIcon name="certified-document" className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        {size ? <p className="text-[13px] text-gosi-midnight-50">{sizeLabel(size)}</p> : null}
        {progress != null && (
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-gosi-midnight-10">
            <div className="h-1 rounded-full bg-gosi-vivid-green" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {onRemove && (
        <button type="button" aria-label={copy.wizard.remove} className="grid h-8 w-8 place-items-center" onClick={onRemove}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
