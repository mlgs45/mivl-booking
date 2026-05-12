"use client";

import { useActionState, useState } from "react";
import { supprimerEnseignant, type AdminEnseignantActionState } from "./actions";

const initialState: AdminEnseignantActionState = { ok: false };

export function SupprimerForm({
  enseignantId,
  nom,
}: {
  enseignantId: string;
  nom: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(supprimerEnseignant, initialState);

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
        Supprimer définitivement <strong>{nom}</strong> ? Cette action est irréversible — le compte, les groupes et tous les rendez-vous associés seront effacés.
      </p>
      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}
      <div className="flex items-center gap-3">
        <form action={action}>
          <input type="hidden" name="enseignantId" value={enseignantId} />
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
