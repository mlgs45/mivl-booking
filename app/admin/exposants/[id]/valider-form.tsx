"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { validerExposant, type AdminActionState } from "./actions";

export function ValiderForm({
  exposantId,
  label = "✓ Valider la participation",
}: {
  exposantId: string;
  /** Personnalisé pour le repêchage depuis la liste d'attente. */
  label?: string;
}) {
  const [, action] = useActionState<AdminActionState, FormData>(
    validerExposant,
    { ok: false },
  );

  return (
    <form action={action}>
      <input type="hidden" name="exposantId" value={exposantId} />
      <SubmitValider label={label} />
    </form>
  );
}

function SubmitValider({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-success hover:bg-success/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? "Validation…" : label}
    </button>
  );
}
