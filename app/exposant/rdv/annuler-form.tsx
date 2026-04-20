"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { annulerRdv, type RdvActionState } from "./actions";

export function AnnulerForm({ rdvId }: { rdvId: string }) {
  const [, action] = useActionState<RdvActionState, FormData>(
    annulerRdv,
    { ok: false },
  );

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="rdvId" value={rdvId} />
      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-danger hover:underline underline-offset-2 disabled:opacity-60"
    >
      {pending ? "…" : "Annuler"}
    </button>
  );
}
