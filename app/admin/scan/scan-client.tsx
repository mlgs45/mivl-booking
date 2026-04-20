"use client";

import { useCallback, useState, useTransition } from "react";
import { QrScanner } from "@/components/scan/qr-scanner";
import { scannerEntreeSalon, type EntreeResult } from "./actions";

type ToastState =
  | { kind: "success"; result: Extract<EntreeResult, { ok: true }> }
  | { kind: "error"; message: string }
  | null;

const KIND_LABELS: Record<string, string> = {
  GROUPE: "Groupe",
  JEUNE: "Jeune",
  DE: "Demandeur d'emploi",
  MEMBRE_STAND: "Équipe stand",
};

const KIND_COLORS: Record<string, string> = {
  GROUPE: "bg-primary text-white",
  JEUNE: "bg-success text-white",
  DE: "bg-accent text-neutral-900",
  MEMBRE_STAND: "bg-neutral-800 text-white",
};

export function ScanEntreeClient() {
  const [toast, setToast] = useState<ToastState>(null);
  const [history, setHistory] = useState<Extract<EntreeResult, { ok: true }>[]>(
    [],
  );
  const [pending, startTransition] = useTransition();
  const [paused, setPaused] = useState(false);

  const handleDecode = useCallback(
    (token: string) => {
      if (paused || pending) return;
      setPaused(true);
      startTransition(async () => {
        const result = await scannerEntreeSalon(token);
        if (result.ok) {
          setToast({ kind: "success", result });
          setHistory((h) => [result, ...h].slice(0, 20));
          if (navigator.vibrate) navigator.vibrate(80);
        } else {
          setToast({ kind: "error", message: result.message });
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
        }
        setTimeout(() => {
          setToast(null);
          setPaused(false);
        }, 1800);
      });
    },
    [paused, pending],
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <QrScanner onDecode={handleDecode} paused={paused} />

        {toast && (
          <div
            className={`absolute inset-x-0 bottom-4 mx-auto max-w-md rounded-2xl p-4 shadow-xl backdrop-blur border ${
              toast.kind === "success"
                ? "bg-white/95 border-success/30"
                : "bg-white/95 border-danger/30"
            }`}
          >
            {toast.kind === "success" ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${KIND_COLORS[toast.result.kind]}`}
                  >
                    {KIND_LABELS[toast.result.kind] ?? toast.result.kind}
                  </span>
                  {toast.result.deja ? (
                    <span className="text-xs text-neutral-500">
                      Déjà scanné
                    </span>
                  ) : (
                    <span className="text-xs text-success font-semibold">
                      ✓ Entrée enregistrée
                    </span>
                  )}
                </div>
                <p className="font-semibold text-neutral-900">
                  {toast.result.label}
                </p>
                {toast.result.sousTitre && (
                  <p className="text-xs text-neutral-700 mt-0.5">
                    {toast.result.sousTitre}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-danger">
                ✗ {toast.message}
              </p>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Derniers scans
          </h2>
          <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-white">
            {history.map((h, i) => (
              <li key={`${h.label}-${i}`} className="p-3 text-sm flex items-start gap-3">
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${KIND_COLORS[h.kind]}`}
                >
                  {KIND_LABELS[h.kind] ?? h.kind}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {h.label}
                  </p>
                  {h.sousTitre && (
                    <p className="text-xs text-neutral-500 truncate">
                      {h.sousTitre}
                    </p>
                  )}
                </div>
                {h.deja && (
                  <span className="text-xs text-neutral-500 shrink-0">
                    (répétition)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
