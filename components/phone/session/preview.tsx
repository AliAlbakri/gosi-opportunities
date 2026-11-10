"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/phone/ui/flow";
import { PrimaryButton } from "@/components/phone/ui/buttons";
import { copy } from "@/lib/copy";

export function PermissionSheet({ open, onClose, onRetry }: { open: boolean; onClose: () => void; onRetry: () => void }) {
  return (
    <BottomSheet title={copy.session.allowTitle} open={open} onClose={onClose}>
      <div className="space-y-3 text-[15px] leading-[22px]">
        <p>{copy.session.allowBody}</p>
        <PrimaryButton className="w-full" onClick={onRetry}>{copy.session.tryAgain}</PrimaryButton>
      </div>
    </BottomSheet>
  );
}

export function useLocalPreview() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [level, setLevel] = useState(0);
  const [denied, setDenied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current: MediaStream | null = null;
    let audio: AudioContext | null = null;
    let frame = 0;
    let stopped = false;
    (async () => {
      try {
        current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (stopped) {
          current.getTracks().forEach((track) => track.stop());
          return;
        }
        setStream(current);
        audio = new AudioContext();
        const source = audio.createMediaStreamSource(current);
        const analyser = audio.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const value of data) {
            const sample = (value - 128) / 128;
            sum += sample * sample;
          }
          setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
          frame = requestAnimationFrame(tick);
        };
        tick();
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") setDenied(true);
        else setFailed(true);
      }
    })();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      current?.getTracks().forEach((track) => track.stop());
      void audio?.close();
    };
  }, []);

  function toggleCamera() {
    const next = !cameraOn;
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraOn(next);
  }

  function toggleMic() {
    const next = !micOn;
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  }

  function retry() {
    setDenied(false);
    setFailed(false);
    window.location.reload();
  }

  return { stream, cameraOn, micOn, level, denied, failed, toggleCamera, toggleMic, retry, setDenied };
}

export function playTestSound() {
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 440;
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.35);
  osc.onended = () => void audio.close();
}

export function deviceKey(personaId: string) {
  return `gosi-device-ok:${personaId}`;
}
