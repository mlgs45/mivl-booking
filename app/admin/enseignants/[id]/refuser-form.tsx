"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { refuserEnseignant, type AdminEnseignantActionState } from "./actions";

export function RefuserForm({ enseignantId }: { enseignantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<AdminEnseignantActionState, FormData>(
    refuserEnseignant,
    { ok: false },
  );

  return (
    <div className="flex-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto bg-white border border-danger/30 text-danger hover:bg-danger/5 font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          ✗ Refuser
        </button>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="enseignantId" value={enseignantId} />
          <textarea
            name="motifRefus"
            placeholder="Motif du refus (transmis à l'enseignant par email)"
            rows={3}
            autoFocus
            required
            minLength={10}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
          />
          {!state.ok && state.message && (
            <p className="text-xs text-danger" role="alert">{state.message}</p>
          )}
          <div className="flex gap-2">
            <SubmitRefus />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-700 hover:text-neutral-900 px-3 py-2"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SubmitRefus() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-danger hover:bg-danger/90 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
    >
      {pending ? "Envoi…" : "Confirmer le refus"}
    </button>
  );
}
