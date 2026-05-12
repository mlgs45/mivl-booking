"use client";

import { useTransition } from "react";
import { toggleFavori } from "../actions";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import type { SecteurCode } from "@/lib/referentiel/secteurs";

type Exposant = {
  id: string;
  raisonSociale: string;
  ville: string;
  secteurs: string[];
  description: string | null;
  numStand: string | null;
};

export function ProgrammeGrid({
  exposants,
  favoris,
}: {
  exposants: Exposant[];
  favoris: string[];
}) {
  const [isPending, startTransition] = useTransition();

  if (exposants.length === 0) {
    return (
      <p className="text-center py-20 text-neutral-500">
        Aucun exposant ne correspond à ce filtre.
      </p>
    );
  }

  const favorisSet = new Set(favoris);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {exposants.map((e) => {
        const isFavori = favorisSet.has(e.id);
        return (
          <div
            key={e.id}
            className={`relative rounded-xl border p-5 transition-all ${
              isFavori
                ? "border-primary/30 bg-primary/5"
                : "border-neutral-100 bg-white hover:border-neutral-200"
            }`}
          >
            {e.numStand && (
              <span className="absolute top-3 right-3 text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                Stand {e.numStand}
              </span>
            )}
            <p className="font-heading font-semibold text-neutral-900 text-sm mb-1 pr-16">
              {e.raisonSociale}
            </p>
            <p className="text-xs text-neutral-500 mb-2">
              {e.ville}
              {e.secteurs.length > 0 && (
                <> · {SECTEUR_LABELS[e.secteurs[0] as SecteurCode] ?? e.secteurs[0]}</>
              )}
            </p>
            {e.description && (
              <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                {e.description}
              </p>
            )}
            <button
              onClick={() => startTransition(() => toggleFavori(e.id))}
              disabled={isPending}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                isFavori
                  ? "border-primary/30 text-primary hover:bg-primary/10"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary"
              }`}
            >
              {isFavori ? "✓ Dans mon programme" : "+ Ajouter à mon programme"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
