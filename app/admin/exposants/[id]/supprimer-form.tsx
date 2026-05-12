"use client";

import { useActionState, useState } from "react";
import { supprimerExposant, type AdminActionState } from "./actions";

const initialState: AdminActionState = { ok: false };

export function SupprimerForm({
  exposantId,
  raisonSociale,
}: {
  exposantId: string;
  raisonSociale: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(supprimerExposant, initialState);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-danger hover:underline underline-offset-2 font-medium"
      >
        Supprimer ce dossier
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 space-y-4">
      <p className="text-sm text-neutral-900">
        Supprimer définitivement <strong>{raisonSociale}</strong> ? Cette action est irréversible — le compte utilisateur, le dossier et toutes les données associées seront effacés.
      </p>

      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}

      <div className="flex items-center gap-3">
        <form action={action}>
          <input type="hidden" name="exposantId" value={exposantId} />
          <button
            type="submit"
            disabled={pending}
            className="bg-danger hover:bg-danger/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {pending ? "Suppression…" : "Confirmer la suppression"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-sm text-neutral-700 hover:text-neutral-900 font-medium"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
