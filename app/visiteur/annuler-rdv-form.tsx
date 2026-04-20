"use client";

import { useTransition } from "react";
import { annulerRdvVisiteur } from "./actions";

export function AnnulerRdvForm({ rdvId }: { rdvId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Annuler ce rendez-vous ? Le créneau sera libéré pour un autre visiteur.")) {
          return;
        }
        startTransition(async () => {
          await annulerRdvVisiteur(rdvId);
        });
      }}
      className="text-xs text-danger hover:underline underline-offset-2 font-medium disabled:opacity-60"
    >
      {pending ? "Annulation…" : "Annuler"}
    </button>
  );
}
