import Link from "next/link";
import { SECTEUR_LABELS, type SecteurCode } from "@/lib/referentiel/secteurs";
import type { TypeOffre } from "@prisma/client";

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Métiers",
  OPPORTUNITES: "Opportunités",
};

export type ExposantCardData = {
  id: string;
  raisonSociale: string;
  ville: string;
  secteurs: string[];
  description: string;
  offres: TypeOffre[];
  innovationMiseEnAvant: boolean;
  descriptionInnovation: string | null;
  numStand: string | null;
};

export function ExposantCard({
  exposant,
  toggleHref,
  selected,
  selectionIndex,
  disabled,
}: {
  exposant: ExposantCardData;
  toggleHref: string;
  selected: boolean;
  selectionIndex?: number;
  disabled?: boolean;
}) {
  const borderClass = selected
    ? "border-primary ring-2 ring-primary/20"
    : disabled
      ? "border-neutral-100 opacity-60"
      : "border-neutral-100 hover:border-primary/30";

  return (
    <article className={`relative rounded-xl border bg-white p-5 transition-all ${borderClass}`}>
      {selected && selectionIndex != null && (
        <span className="absolute -top-2 -right-2 z-10 bg-primary text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
          {selectionIndex + 1}
        </span>
      )}

      <header className="mb-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-heading font-bold text-neutral-900 leading-tight">
            {exposant.raisonSociale}
          </h3>
          {exposant.numStand && (
            <span className="shrink-0 text-xs bg-neutral-100 text-neutral-700 font-semibold px-2 py-0.5 rounded-full">
              {exposant.numStand}
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500">{exposant.ville}</p>
      </header>

      <div className="flex flex-wrap gap-1 mb-3">
        {exposant.secteurs.slice(0, 2).map((s) => (
          <span key={s} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
            {SECTEUR_LABELS[s as SecteurCode] ?? s}
          </span>
        ))}
        {exposant.secteurs.length > 2 && (
          <span className="text-xs text-neutral-500 px-1">+{exposant.secteurs.length - 2}</span>
        )}
      </div>

      <p className="text-sm text-neutral-700 line-clamp-3 mb-3">
        {exposant.description}
      </p>

      {exposant.innovationMiseEnAvant && (
        <div className="mb-3 rounded-lg bg-accent/20 border border-accent/30 p-2.5 text-xs text-neutral-900">
          <strong className="font-semibold">💡 Innovation :</strong>{" "}
          {exposant.descriptionInnovation}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-4">
        {exposant.offres.map((o) => (
          <span
            key={o}
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              o === "OPPORTUNITES"
                ? "bg-primary/10 text-primary"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {OFFRE_LABELS[o]}
          </span>
        ))}
      </div>

      <Link
        href={toggleHref}
        scroll={false}
        aria-disabled={disabled}
        className={`block w-full text-center font-semibold px-4 py-2 rounded-lg text-sm transition-colors ${
          selected
            ? "bg-primary text-white hover:bg-primary/90"
            : disabled
              ? "bg-neutral-100 text-neutral-500 pointer-events-none cursor-not-allowed"
              : "bg-white border border-neutral-200 text-neutral-900 hover:border-primary hover:text-primary"
        }`}
      >
        {selected ? "✓ Sélectionné · retirer" : disabled ? "Sélection pleine" : "+ Ajouter"}
      </Link>
    </article>
  );
}
