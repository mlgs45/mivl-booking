import { db } from "@/lib/db";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { ExposantsGrid, type ExposantPublic } from "./exposants-grid";

export const metadata = {
  title: "Exposants participants — MIVL Connect",
  description:
    "Découvrez les entreprises industrielles qui participent au salon Made In Val de Loire 2026.",
};

export const revalidate = 300;

export default async function ExposantsPage() {
  const exposants: ExposantPublic[] = await db.exposant.findMany({
    where: { statut: "VALIDE" },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      codePostal: true,
      secteurs: true,
      secteurAutre: true,
      description: true,
      siteWeb: true,
      logoUrl: true,
      offres: true,
      estPartenaire: true,
    },
    orderBy: [{ estPartenaire: "desc" }, { raisonSociale: "asc" }],
  });

  return (
    <>
      <PublicHeader />

      <main>
        <section className="bg-primary text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3 text-white">
              Exposants participants
            </h1>
            <p className="text-white/80 max-w-xl">
              {exposants.length} entreprise{exposants.length !== 1 ? "s" : ""}{" "}
              industrielle{exposants.length !== 1 ? "s" : ""} participent au
              salon Made In Val de Loire 2026.
            </p>
          </div>
        </section>

        {exposants.length === 0 ? (
          <section className="py-14 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center py-20 text-neutral-700">
              <p className="text-lg font-medium mb-2">
                Les exposants seront annoncés prochainement.
              </p>
              <p className="text-sm">
                Les inscriptions exposants ouvrent le 1er juillet 2026.
              </p>
            </div>
          </section>
        ) : (
          <ExposantsGrid exposants={exposants} />
        )}
      </main>

      <PublicFooter />
    </>
  );
}
