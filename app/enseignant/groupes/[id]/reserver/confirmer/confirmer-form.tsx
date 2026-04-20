"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmerParcours } from "../../../actions";

export function ConfirmerForm({
  groupeId,
  exposantIds,
}: {
  groupeId: string;
  exposantIds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmerParcours(groupeId, exposantIds);
      if (result.ok) {
        router.push(`/enseignant/groupes/${groupeId}?confirme=1`);
      } else {
        setError(result.error ?? "Erreur inconnue.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
          <strong className="font-semibold">Impossible de réserver :</strong> {error}
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        {pending ? "Réservation en cours…" : "Confirmer le parcours"}
      </button>
    </div>
  );
}
