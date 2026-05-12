"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { remettreEnAttente, type AdminActionState } from "./actions";

export function RemettreEnAttenteForm({ exposantId }: { exposantId: string }) {
  const [state, action] = useActionState<AdminActionState, FormData>(
    remettreEnAttente,
    { ok: false },
  );

  return (
    <form action={action}>
      <input type="hidden" name="exposantId" value={exposantId} />
      {state.message && !state.ok && (
        <p className="mb-2 text-sm text-danger">{state.message}</p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm font-medium text-neutral-600 hover:text-warning border border-neutral-200 hover:border-warning/50 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? "Annulation…" : "↩ Remettre en attente"}
    </button>
  );
}
