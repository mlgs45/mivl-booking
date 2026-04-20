"use client";

import { useCallback, useState, useTransition } from "react";
import { QrScanner } from "@/components/scan/qr-scanner";
import {
  scannerVisiteurStand,
  ajouterWalkInAnonyme,
  type ScanStandResult,
} from "./actions";

type Toast =
  | { kind: "success"; result: Extract<ScanStandResult, { ok: true }> }
  | { kind: "error"; message: string }
  | { kind: "walkin"; label: string }
  | null;

type HistoryItem = {
  id: string;
  label: string;
  sousTitre: string;
  mode: "PRESENT" | "WALK_IN" | "WALK_IN_ANON";
  horaire?: string;
  deja: boolean;
};

export function ScanStandClient() {
  const [toast, setToast] = useState<Toast>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pending, startTransition] = useTransition();
  const [paused, setPaused] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);

  const handleDecode = useCallback(
    (token: string) => {
      if (paused || pending) return;
      setPaused(true);
      startTransition(async () => {
        const result = await scannerVisiteurStand(token);
        if (result.ok) {
          setToast({ kind: "success", result });
          if (!result.deja) {
            setHistory((h) =>
              [
                {
                  id: `${token}-${Date.now()}`,
                  label: result.label,
                  sousTitre: result.sousTitre,
                  mode: result.mode,
                  horaire: result.horaire,
                  deja: false,
                },
                ...h,
              ].slice(0, 20),
            );
          }
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
        <QrScanner onDecode={handleDecode} paused={paused || walkInOpen} />

        {toast?.kind === "success" && (
          <div className="absolute inset-x-0 bottom-4 mx-auto max-w-md rounded-2xl p-4 shadow-xl backdrop-blur border bg-white/95 border-success/30">
            <div className="flex items-center gap-2 mb-1">
              {toast.result.mode === "PRESENT" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success text-white">
                  ✓ Présent
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-neutral-900">
                  Walk-in
                </span>
              )}
              {toast.result.deja && (
                <span className="text-xs text-neutral-500">Déjà enregistré</span>
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
            {toast.result.horaire && (
              <p className="text-xs text-success font-medium mt-1">
                RDV {toast.result.horaire}
              </p>
            )}
          </div>
        )}

        {toast?.kind === "error" && (
          <div className="absolute inset-x-0 bottom-4 mx-auto max-w-md rounded-2xl p-4 shadow-xl backdrop-blur bg-white/95 border border-danger/30">
            <p className="text-sm font-semibold text-danger">✗ {toast.message}</p>
          </div>
        )}

        {toast?.kind === "walkin" && (
          <div className="absolute inset-x-0 bottom-4 mx-auto max-w-md rounded-2xl p-4 shadow-xl backdrop-blur bg-white/95 border border-accent/40">
            <p className="text-sm font-semibold text-neutral-900">
              ✓ Walk-in anonyme ajouté : {toast.label}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setWalkInOpen(true)}
        className="w-full bg-white border border-neutral-200 hover:border-accent text-neutral-900 font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
      >
        + Ajouter un walk-in anonyme
      </button>

      {walkInOpen && (
        <WalkInDialog
          onClose={() => setWalkInOpen(false)}
          onAdded={(label) => {
            setHistory((h) =>
              [
                {
                  id: `walkin-anon-${Date.now()}`,
                  label,
                  sousTitre: "Walk-in anonyme",
                  mode: "WALK_IN_ANON" as const,
                  deja: false,
                },
                ...h,
              ].slice(0, 20),
            );
            setToast({ kind: "walkin", label });
            setTimeout(() => setToast(null), 1800);
          }}
        />
      )}

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Derniers passages
          </h2>
          <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-white">
            {history.map((h) => (
              <li key={h.id} className="p-3 text-sm flex items-start gap-3">
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    h.mode === "PRESENT"
                      ? "bg-success text-white"
                      : "bg-accent text-neutral-900"
                  }`}
                >
                  {h.mode === "PRESENT" ? "Présent" : "Walk-in"}
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
                {h.horaire && (
                  <span className="text-xs text-neutral-500 shrink-0">
                    {h.horaire}
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

function WalkInDialog({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (label: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await ajouterWalkInAnonyme(fd);
      if (result.ok) {
        onAdded(result.label);
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-heading font-bold text-neutral-900 mb-1">
          Walk-in anonyme
        </h2>
        <p className="text-sm text-neutral-700 mb-5">
          Passage sans badge QR — les informations sont optionnelles.
        </p>
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input name="prenom" label="Prénom" maxLength={60} />
            <Input name="nom" label="Nom" maxLength={60} />
          </div>
          <Input
            name="profil"
            label="Profil"
            placeholder="Ex: Lycéen terminale, parent, pro…"
            maxLength={120}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 font-semibold px-4 py-2.5 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  name,
  label,
  placeholder,
  maxLength,
}: {
  name: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-neutral-900 mb-1">
        {label}
      </span>
      <input
        name={name}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
    </label>
  );
}
