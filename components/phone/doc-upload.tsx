"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { uploadAction } from "@/app/actions/flow";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

export function DocUpload({
  personId,
  kind,
  title,
  button,
  files,
}: {
  personId: string;
  kind: "cv" | "certificate";
  title: string;
  button: string;
  files: { id: string; kind: string; file_name: string }[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [chosen, setChosen] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => setMounted(true), []);

  async function upload() {
    if (!chosen) {
      setMessage(copy.uploadNeedFile);
      return;
    }
    setUploading(true);
    setMessage(null);
    const data = new FormData();
    data.set("file", chosen);
    try {
      const result = await uploadAction(personId, kind, data);
      setMessage(result.ok ? copy.uploadDone : result.error);
      if (result.ok) {
        setChosen(null);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  const mine = files.filter((file) => file.kind === kind);
  return (
    <div className="space-y-3 rounded-3xl bg-white p-4 text-sm">
      <p>{title}</p>
      {mounted &&
        createPortal(
          <input
            ref={inputRef}
            type="file"
            className="fixed top-0 h-px w-px opacity-[0.01]"
            style={{ left: "-10000px" }}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={(event) => {
              setChosen(event.target.files?.[0] ?? null);
              setMessage(null);
            }}
          />,
          document.body,
        )}
      <button type="button" className="text-gosi-blue" onClick={() => inputRef.current?.click()}>
        {chosen ? chosen.name : copy.uploadChoose}
      </button>
      <Button size="md" variant={kind === "cv" ? "primary" : "secondary"} type="button" disabled={uploading} onClick={() => void upload()}>
        {uploading ? copy.uploadBusy : button}
      </Button>
      {message && <p>{message}</p>}
      {mine.map((file) => (
        <p key={file.id} className="text-gosi-midnight-80">{file.file_name}</p>
      ))}
    </div>
  );
}
