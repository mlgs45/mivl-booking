import { db } from "@/lib/db";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import type { SecteurCode } from "@/lib/referentiel/secteurs";
import type { TypeOffre } from "@prisma/client";

export const metadata = {
  title: "Exposants participants — MIVL Booking",
  description:
    "Découvrez les entreprises industrielles qui participent au salon Made In Val de Loire 2026.",
};

export const revalidate = 300;

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Découverte métiers",
  OPPORTUNITES: "Opportunités",
};

export default async function ExposantsPage() {
  const exposants = await db.exposant.findMany({
    where: { statut: "VALIDE" },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      secteurs: true,
      secteurAutre: true,
      description: true,
      siteWeb: true,
      offres: true,
    },
    orderBy: { raisonSociale: "asc" },
  });

  return (
    <>
      <PublicHeader />

      <main>
        {/* Header section */}
        <section className="bg-primary text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
              Exposants participants
            </h1>
            <p className="text-white/80 max-w-xl">
              {exposants.length} entreprise{exposants.length !== 1 ? "s" : ""}{" "}
              industrielle{exposants.length !== 1 ? "s" : ""} participent au
              salon Made In Val de Loire 2026.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-14 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {exposants.length === 0 ? (
              <div className="text-center py-20 text-neutral-700">
                <p className="text-lg font-medium mb-2">
                  Les exposants seront annoncés prochainement.
                </p>
                <p className="text-sm">
                  Les inscriptions exposants ouvrent le 1er juillet 2026.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {exposants.map((e) => {
                  const secteurLabels = [
                    ...e.secteurs.map(
                      (code) => SECTEUR_LABELS[code as SecteurCode] ?? code,
                    ),
                    ...(e.secteurAutre ? [e.secteurAutre] : []),
                  ];
                  return (
                    <div
                      key={e.id}
                      className="bg-white rounded-xl border border-neutral-100 p-6 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="text-base font-heading font-bold text-neutral-900 leading-snug">
                          {e.raisonSociale}
                        </h2>
                        <div className="shrink-0 flex flex-col items-end gap-1 max-w-[55%]">
                          {secteurLabels.map((label) => (
                            <span
                              key={label}
                              className="text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full text-right"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-neutral-700 leading-relaxed mb-5 flex-1 line-clamp-3">
                        {e.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-neutral-100">
                        <span className="text-xs text-neutral-700">
                          📍 {e.ville}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {e.offres.map((offre) => (
                            <span
                              key={offre}
                              className="text-xs text-neutral-700 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded"
                            >
                              {OFFRE_LABELS[offre]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {e.siteWeb && (
                        <a
                          href={e.siteWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 text-xs text-primary hover:underline underline-offset-2"
                        >
                          Voir le site →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
