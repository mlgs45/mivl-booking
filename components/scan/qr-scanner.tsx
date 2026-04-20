"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

type Props = {
  onDecode: (token: string) => void;
  paused?: boolean;
  /** Intervalle minimum entre deux détections du même token (ms). */
  cooldownMs?: number;
};

export function QrScanner({ onDecode, paused, cooldownMs = 2000 }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastHitRef = useRef<{ text: string; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [camIdx, setCamIdx] = useState(0);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  useEffect(() => {
    if (paused) {
      stop();
      return;
    }

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    (async () => {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        if (cancelled) return;
        setCameras(devices);

        const preferred =
          devices.find((d) => /back|arrière|environment/i.test(d.label)) ??
          devices[camIdx] ??
          devices[0];

        if (!preferred) {
          setError("Aucune caméra détectée.");
          return;
        }

        const controls = await reader.decodeFromVideoDevice(
          preferred.deviceId,
          videoRef.current!,
          (result) => {
            if (!result) return;
            const text = result.getText();
            const now = Date.now();
            if (
              lastHitRef.current &&
              lastHitRef.current.text === text &&
              now - lastHitRef.current.at < cooldownMs
            ) {
              return;
            }
            lastHitRef.current = { text, at: now };
            onDecode(text);
          },
        );

        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setReady(true);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Accès caméra refusé. Autorise la caméra dans les réglages du navigateur."
            : "Impossible d'initialiser la caméra.",
        );
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [paused, camIdx, onDecode, cooldownMs, stop]);

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-neutral-900 rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-2/3 aspect-square border-2 border-white/70 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>

      {cameras.length > 1 && (
        <button
          type="button"
          onClick={() => setCamIdx((i) => (i + 1) % cameras.length)}
          className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur"
        >
          ↺ Caméra
        </button>
      )}

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
          Initialisation de la caméra…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="text-white text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
