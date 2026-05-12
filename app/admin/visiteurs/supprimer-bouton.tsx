"use client";

import { useActionState, useState } from "react";
import { supprimerVisiteur, type AdminVisiteurActionState } from "./actions";

const initialState: AdminVisiteurActionState = { ok: false };

export function SupprimerBouton({ visiteurId, nom }: { visiteurId: string; nom: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(supprimerVisiteur, initialState);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-danger text-sm font-medium hover:underline underline-offset-2"
      >
        Supprimer
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <form action={action} className="contents">
        <input type="hidden" name="visiteurId" value={visiteurId} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-semibold text-white bg-danger hover:bg-danger/90 px-2.5 py-1 rounded-md disabled:opacity-60"
        >
          {pending ? "…" : "Confirmer"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="text-xs text-neutral-500 hover:text-neutral-700"
      >
        Annuler
      </button>
    </span>
  );
}
