"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { validerEnseignant, type AdminEnseignantActionState } from "./actions";

export function ValiderForm({ enseignantId }: { enseignantId: string }) {
  const [, action] = useActionState<AdminEnseignantActionState, FormData>(
    validerEnseignant,
    { ok: false },
  );

  return (
    <form action={action}>
      <input type="hidden" name="enseignantId" value={enseignantId} />
      <SubmitValider />
    </form>
  );
}

function SubmitValider() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-success hover:bg-success/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? "Validation…" : "✓ Valider l'inscription"}
    </button>
  );
}
