"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { TypeOffre } from "@prisma/client";
import { SECTEURS, SECTEUR_LABELS, type SecteurCode } from "@/lib/referentiel/secteurs";
import {
  departementFromCodePostal,
  labelDepartement,
} from "@/lib/referentiel/departements";

export type ExposantPublic = {
  id: string;
  raisonSociale: string;
  ville: string;
  codePostal: string | null;
  secteurs: string[];
  secteurAutre: string | null;
  description: string;
  siteWeb: string | null;
  logoUrl: string | null;
  offres: TypeOffre[];
  estPartenaire: boolean;
};

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Découverte métiers",
  OPPORTUNITES: "Opportunités",
};

const OFFRE_CODES: TypeOffre[] = [
  "DECOUVERTE_ENTREPRISE",
  "DECOUVERTE_METIERS",
  "OPPORTUNITES",
];

export function ExposantsGrid({ exposants }: { exposants: ExposantPublic[] }) {
  const [query, setQuery] = useState("");
  const [departement, setDepartement] = useState<string>("");
  const [filiere, setFiliere] = useState<SecteurCode | "">("");
  const [offre, setOffre] = useState<TypeOffre | "">("");

  const departementsPresent = useMemo(() => {
    const codes = new Set<string>();
    for (const e of exposants) {
      const d = departementFromCodePostal(e.codePostal);
      if (d) codes.add(d);
    }
    return Array.from(codes).sort();
  }, [exposants]);

  const filiereCodes = useMemo(() => {
    const present = new Set<string>();
    for (const e of exposants) for (const s of e.secteurs) present.add(s);
    return SECTEURS.filter((s) => present.has(s.code));
  }, [exposants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exposants.filter((e) => {
      if (q) {
        const haystack = `${e.raisonSociale} ${e.ville} ${e.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (departement) {
        if (departementFromCodePostal(e.codePostal) !== departement) return false;
      }
      if (filiere) {
        if (!e.secteurs.includes(filiere)) return false;
      }
      if (offre) {
        if (!e.offres.includes(offre)) return false;
      }
      return true;
    });
  }, [exposants, query, departement, filiere, offre]);

  const hasFilter = query || departement || filiere || offre;

  return (
    <>
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3">
          <label className="relative">
            <span className="sr-only">Rechercher</span>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une entreprise, une ville…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-100 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </label>
          <select
            value={departement}
            onChange={(e) => setDepartement(e.target.value)}
            className="text-sm rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous départements</option>
            {departementsPresent.map((code) => (
              <option key={code} value={code}>
                {labelDepartement(code)}
              </option>
            ))}
          </select>
          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value as SecteurCode | "")}
            className="text-sm rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes filières</option>
            {filiereCodes.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={offre}
            onChange={(e) => setOffre(e.target.value as TypeOffre | "")}
            className="text-sm rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes raisons</option>
            {OFFRE_CODES.map((code) => (
              <option key={code} value={code}>
                {OFFRE_LABELS[code]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDepartement("");
              setFiliere("");
              setOffre("");
            }}
            disabled={!hasFilter}
            className="text-sm font-medium text-primary hover:underline underline-offset-2 disabled:opacity-40 disabled:no-underline px-2"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <section className="py-10 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-neutral-700 mb-6">
            {filtered.length} entreprise{filtered.length !== 1 ? "s" : ""} affichée
            {filtered.length !== 1 ? "s" : ""}
            {hasFilter && ` sur ${exposants.length}`}.
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-neutral-700">
              <p className="text-lg font-medium mb-2">Aucun exposant ne correspond.</p>
              <p className="text-sm">Essayez d&apos;élargir vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((e) => (
                <ExposantCard key={e.id} exposant={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ExposantCard({ exposant }: { exposant: ExposantPublic }) {
  const dept = departementFromCodePostal(exposant.codePostal);
  const secteurLabels = [
    ...exposant.secteurs.map((code) => SECTEUR_LABELS[code as SecteurCode] ?? code),
    ...(exposant.secteurAutre ? [exposant.secteurAutre] : []),
  ];

  return (
    <article
      className={`bg-white rounded-xl border p-5 flex flex-col transition-all hover:border-primary/40 hover:shadow-md ${
        exposant.estPartenaire
          ? "border-accent/60 ring-1 ring-accent/30"
          : "border-neutral-100"
      }`}
    >
      {exposant.estPartenaire && (
        <span className="self-start inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-900 bg-accent/30 px-2.5 py-1 rounded-full mb-3">
          ★ Partenaire
        </span>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-16 h-16 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden">
          {exposant.logoUrl ? (
            <Image
              src={exposant.logoUrl}
              alt={`Logo ${exposant.raisonSociale}`}
              width={64}
              height={64}
              className="object-contain w-full h-full p-1"
            />
          ) : (
            <span className="text-xl font-heading font-bold text-neutral-500">
              {exposant.raisonSociale.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-heading font-bold text-neutral-900 leading-snug mb-1 line-clamp-2">
            {exposant.raisonSociale}
          </h2>
          <p className="text-xs text-neutral-700">
            {exposant.ville}
            {dept ? ` · ${dept}` : ""}
          </p>
        </div>
      </div>

      {secteurLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {secteurLabels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="text-[11px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
          {secteurLabels.length > 2 && (
            <span className="text-[11px] font-medium text-neutral-500 px-1 py-0.5">
              +{secteurLabels.length - 2}
            </span>
          )}
        </div>
      )}

      <p className="text-sm text-neutral-700 leading-relaxed mb-4 flex-1 line-clamp-3">
        {exposant.description}
      </p>

      <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-neutral-100">
        <div className="flex flex-wrap gap-1">
          {exposant.offres.map((offre) => (
            <span
              key={offre}
              className="text-[11px] text-neutral-700 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded"
            >
              {OFFRE_LABELS[offre]}
            </span>
          ))}
        </div>
        {exposant.siteWeb && (
          <a
            href={exposant.siteWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-primary hover:underline underline-offset-2 font-medium"
          >
            Site →
          </a>
        )}
      </div>
    </article>
  );
}
