"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { soumettreExposantAdmin, type AdminActionState } from "./actions";

export function SoumettreForm({ exposantId }: { exposantId: string }) {
  const [state, action] = useActionState<AdminActionState, FormData>(
    soumettreExposantAdmin,
    { ok: false },
  );

  return (
    <div className="space-y-3">
      <form action={action}>
        <input type="hidden" name="exposantId" value={exposantId} />
        <SubmitSoumettre />
      </form>

      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}
    </div>
  );
}

function SubmitSoumettre() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? "Soumission…" : "Soumettre cette fiche"}
    </button>
  );
}
