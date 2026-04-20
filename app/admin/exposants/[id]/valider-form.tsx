"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { validerExposant, type AdminActionState } from "./actions";

export function ValiderForm({ exposantId }: { exposantId: string }) {
  const [, action] = useActionState<AdminActionState, FormData>(
    validerExposant,
    { ok: false },
  );

  return (
    <form action={action}>
      <input type="hidden" name="exposantId" value={exposantId} />
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
      {pending ? "Validation…" : "✓ Valider la participation"}
    </button>
  );
}
