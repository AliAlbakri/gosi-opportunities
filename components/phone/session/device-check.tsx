"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Mic, Volume2 } from "lucide-react";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { AppHeader } from "@/components/phone/ui/header";
import { copy } from "@/lib/copy";
import { deviceKey, PermissionSheet, playTestSound, useLocalPreview } from "@/components/phone/session/preview";

export function DeviceCheck({ personaId }: { personaId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const preview = useLocalPreview();
  useEffect(() => {
    if (videoRef.current && preview.stream) videoRef.current.srcObject = preview.stream;
  }, [preview.stream]);
  return (
    <div className="flex min-h-full flex-col text-gosi-rich-blue">
      <AppHeader title={copy.session.deviceTitle} />
      <div className="space-y-4 px-5 py-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-gosi-midnight">
          <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${preview.cameraOn ? "" : "invisible"}`} />
          {!preview.cameraOn && <p className="absolute inset-0 grid place-items-center text-sm text-white">{copy.session.camera}</p>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gosi-midnight-10">
          <div className="h-full rounded-full bg-gosi-vivid-green" style={{ width: `${Math.round(preview.level * 100)}%` }} />
        </div>
        <div className="flex gap-3">
          <button type="button" className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full ${preview.micOn ? "bg-white" : "bg-gosi-midnight-25"}`} onClick={preview.toggleMic}>
            <Mic size={18} />{copy.session.microphone}
          </button>
          <button type="button" className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full ${preview.cameraOn ? "bg-white" : "bg-gosi-midnight-25"}`} onClick={preview.toggleCamera}>
            <Camera size={18} />{copy.session.camera}
          </button>
        </div>
        <button type="button" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold" onClick={playTestSound}>
          <Volume2 size={18} />{copy.session.speakerTest}
        </button>
        {preview.failed && <p className="text-[15px]">{copy.session.network}</p>}
        <PrimaryButton
          className="w-full"
          onClick={() => {
            localStorage.setItem(deviceKey(personaId), "1");
            router.back();
          }}
        >
          {copy.session.everythingWorks}
        </PrimaryButton>
      </div>
      <PermissionSheet open={preview.denied} onClose={() => preview.setDenied(false)} onRetry={preview.retry} />
    </div>
  );
}
