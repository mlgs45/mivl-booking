"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmerSpeedDatings } from "../../actions";
import type { ReserverSpeedDatingsResult } from "@/lib/booking/speed-datings";

export function ConfirmerForm({ exposantIds }: { exposantIds: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ReserverSpeedDatingsResult | null>(null);

  const submit = () => {
    setError(null);
    setOutcome(null);
    startTransition(async () => {
      const res = await confirmerSpeedDatings(exposantIds);
      if (!res.ok) {
        setError(res.error ?? "Erreur inconnue.");
        return;
      }
      const result = res.result!;
      if (result.echecs.length === 0) {
        router.push("/visiteur?confirme=1");
      } else {
        setOutcome(result);
      }
    });
  };

  if (outcome) {
    return (
      <div className="space-y-3">
        {outcome.confirmes.length > 0 && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success">
            <strong className="font-semibold">
              {outcome.confirmes.length} rendez-vous confirmé{outcome.confirmes.length > 1 ? "s" : ""}.
            </strong>
          </div>
        )}
        {outcome.echecs.length > 0 && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger space-y-1">
            <strong className="font-semibold">
              {outcome.echecs.length} rendez-vous non réservé{outcome.echecs.length > 1 ? "s" : ""} :
            </strong>
            <ul className="list-disc list-inside text-xs">
              {outcome.echecs.map((e, i) => (
                <li key={i}>
                  {e.raisonSociale ? <strong>{e.raisonSociale}</strong> : null} {e.raison}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={() => router.push("/visiteur")}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Voir mes rendez-vous
        </button>
      </div>
    );
  }

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
        {pending ? "Réservation en cours…" : "Confirmer mes rendez-vous"}
      </button>
    </div>
  );
}
