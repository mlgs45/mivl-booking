import Link from "next/link";
import { SECTEUR_LABELS, type SecteurCode } from "@/lib/referentiel/secteurs";
import type { TypeOffre } from "@prisma/client";

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Métiers",
  OPPORTUNITES: "Opportunités (stages, alternance, emploi)",
};

export function BookingFilterBar({
  baseHref,
  searchParams,
  secteurs,
  offres,
  selectedSecteur,
  selectedOffre,
}: {
  baseHref: string;
  searchParams: Record<string, string | undefined>;
  secteurs: SecteurCode[];
  offres: TypeOffre[];
  selectedSecteur?: string;
  selectedOffre?: string;
}) {
  const hrefFor = (patch: Record<string, string | undefined>) => {
    const merged = { ...searchParams, ...patch };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v != null && v !== "") qs.set(k, v);
    }
    const s = qs.toString();
    return s ? `${baseHref}?${s}` : baseHref;
  };

  return (
    <div className="space-y-3 mb-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
          Offres proposées
        </span>
        <div className="flex flex-wrap gap-2">
          <Pill href={hrefFor({ offre: undefined })} active={!selectedOffre} label="Toutes" />
          {offres.map((o) => (
            <Pill
              key={o}
              href={hrefFor({ offre: o })}
              active={selectedOffre === o}
              label={OFFRE_LABELS[o]}
            />
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
          Secteurs
        </span>
        <div className="flex flex-wrap gap-2">
          <Pill href={hrefFor({ secteur: undefined })} active={!selectedSecteur} label="Tous" />
          {secteurs.map((s) => (
            <Pill
              key={s}
              href={hrefFor({ secteur: s })}
              active={selectedSecteur === s}
              label={SECTEUR_LABELS[s]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Pill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {label}
    </Link>
  );
}
