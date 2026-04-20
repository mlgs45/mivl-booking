"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { togglePartenaire, type AdminActionState } from "./actions";

export function PartenaireToggle({
  exposantId,
  estPartenaire,
}: {
  exposantId: string;
  estPartenaire: boolean;
}) {
  const [state, action] = useActionState<AdminActionState, FormData>(
    togglePartenaire,
    { ok: false },
  );

  return (
    <form action={action} className="flex items-start justify-between gap-4">
      <input type="hidden" name="exposantId" value={exposantId} />
      <div>
        <p className="text-sm font-semibold text-neutral-900">
          {estPartenaire ? "Exposant partenaire" : "Exposant standard"}
        </p>
        <p className="text-xs text-neutral-700 mt-0.5">
          {estPartenaire
            ? "Un badge « Partenaire » est affiché sur la liste publique et la fiche."
            : "Active ce marqueur pour mettre en avant ce profil comme partenaire du salon."}
        </p>
        {state.message && (
          <p
            className={`text-xs mt-2 ${state.ok ? "text-success" : "text-danger"}`}
          >
            {state.message}
          </p>
        )}
      </div>
      <Submit on={estPartenaire} />
    </form>
  );
}

function Submit({ on }: { on: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={on}
      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
        on
          ? "bg-accent text-neutral-900 hover:bg-accent/90"
          : "bg-white border border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"
      }`}
    >
      {pending ? "…" : on ? "✓ Partenaire" : "Marquer partenaire"}
    </button>
  );
}
