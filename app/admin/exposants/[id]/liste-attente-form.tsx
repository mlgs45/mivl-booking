"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { mettreEnListeAttente, type AdminActionState } from "./actions";

export function ListeAttenteForm({ exposantId }: { exposantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<AdminActionState, FormData>(
    mettreEnListeAttente,
    { ok: false },
  );

  return (
    <div className="flex-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto bg-white border border-accent text-neutral-900 hover:bg-accent/10 font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          ⏳ Mettre en liste d&apos;attente
        </button>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="exposantId" value={exposantId} />
          <p className="text-sm text-neutral-700">
            L&apos;exposant recevra l&apos;email type expliquant que les 120
            stands sont attribués et qu&apos;il sera recontacté en priorité en
            cas de désistement.
          </p>
          <textarea
            name="message"
            placeholder="Message complémentaire (facultatif) — ajouté à l'email, ex. rang sur la liste ou échéance de réponse"
            rows={3}
            autoFocus
            maxLength={1000}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {!state.ok && state.message && (
            <p className="text-xs text-danger" role="alert">{state.message}</p>
          )}
          <div className="flex gap-2">
            <SubmitListeAttente />
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

function SubmitListeAttente() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-neutral-900 hover:bg-neutral-900/90 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
    >
      {pending ? "Envoi…" : "Confirmer la mise en liste d'attente"}
    </button>
  );
}
