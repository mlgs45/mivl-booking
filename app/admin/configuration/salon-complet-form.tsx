"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { basculerSalonComplet, type ConfigActionState } from "./actions";

export function SalonCompletForm({ actif }: { actif: boolean }) {
  const [state, action] = useActionState<ConfigActionState, FormData>(
    basculerSalonComplet,
    { ok: false },
  );

  return (
    <div className="space-y-6">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          actif
            ? "border-accent bg-accent/20"
            : "border-neutral-200 bg-neutral-50"
        }`}
      >
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${
            actif ? "bg-accent-dark animate-pulse" : "bg-neutral-400"
          }`}
        />
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {actif ? "Bandeau affiché" : "Bandeau masqué"}
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">
            {actif
              ? "Les entreprises sont prévenues qu'elles partent en liste d'attente."
              : "Les entreprises s'inscrivent sans mention particulière."}
          </p>
        </div>
      </div>

      {state.message && (
        <p
          className={`text-sm font-medium ${
            state.ok ? "text-success" : "text-danger"
          }`}
        >
          {state.message}
        </p>
      )}

      <form action={action}>
        <input type="hidden" name="actif" value={actif ? "0" : "1"} />
        <SubmitButton actif={actif} />
      </form>
    </div>
  );
}

function SubmitButton({ actif }: { actif: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        actif
          ? "w-full sm:w-auto border border-neutral-200 text-neutral-900 hover:bg-neutral-50 font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          : "w-full sm:w-auto bg-accent hover:bg-accent-dark text-neutral-900 font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
      }
    >
      {pending
        ? "Enregistrement…"
        : actif
          ? "Masquer le bandeau"
          : "Afficher le bandeau « salon complet »"}
    </button>
  );
}
