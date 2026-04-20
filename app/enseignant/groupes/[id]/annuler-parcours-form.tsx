"use client";

import { useTransition } from "react";
import { annulerParcours } from "../actions";

export function AnnulerParcoursForm({ groupeId }: { groupeId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Annuler le parcours et libérer les 4 créneaux ? Cette action est définitive.")) {
          return;
        }
        startTransition(async () => {
          await annulerParcours(groupeId);
        });
      }}
      className="text-sm text-danger hover:underline underline-offset-2 font-medium disabled:opacity-60"
    >
      {pending ? "Annulation…" : "Annuler le parcours"}
    </button>
  );
}
