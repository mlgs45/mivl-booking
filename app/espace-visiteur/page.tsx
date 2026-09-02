import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import type { SecteurCode } from "@/lib/referentiel/secteurs";

export const metadata = { title: "Mon espace visiteur — MIVL Connect" };

export default async function EspaceVisiteurPage() {
  const session = await auth();
  if (!session?.user) return null;

  const visiteur = await db.visiteur.findUnique({
    where: { userId: session.user.id },
    select: { id: true, prenom: true, exposantsFavoris: true },
  });
  if (!visiteur) redirect("/connexion");

  const favoris = visiteur.exposantsFavoris.length > 0
    ? await db.exposant.findMany({
        where: { id: { in: visiteur.exposantsFavoris }, statut: "VALIDE" },
        select: {
          id: true,
          raisonSociale: true,
          ville: true,
          secteurs: true,
          numStand: true,
          description: true,
        },
        orderBy: { raisonSociale: "asc" },
      })
    : [];

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Bonjour {visiteur.prenom} !
          </h1>
          <p className="text-sm text-neutral-700 mt-1">
            Salon Made In Val de Loire — 15 octobre 2026
          </p>
          <p className="text-sm text-neutral-700 mt-3 max-w-xl">
            Repérez dès maintenant les entreprises que vous souhaitez rencontrer pour
            préparer votre journée. L&apos;accès aux stands est libre : il n&apos;y a
            aucun rendez-vous à prendre.
          </p>
        </div>

        {/* Ma visite */}
        <div className="rounded-xl border border-neutral-100 bg-white p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-semibold text-neutral-900">Ma visite</h2>
              <p className="text-sm text-neutral-600 mt-0.5">
                {favoris.length > 0
                  ? `${favoris.length} entreprise${favoris.length > 1 ? "s" : ""} à visiter`
                  : "Aucune entreprise repérée pour l'instant."}
              </p>
            </div>
                          <Link
                href="/espace-visiteur/programme"
                className="shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {favoris.length > 0 ? "Modifier" : "Préparer ma visite"}
              </Link>
          </div>

          {favoris.length > 0 ? (
            <ul className="divide-y divide-neutral-100">
              {favoris.map((e) => (
                <li key={e.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{e.raisonSociale}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {e.ville}
                      {e.secteurs.length > 0 && (
                        <> · {SECTEUR_LABELS[e.secteurs[0] as SecteurCode] ?? e.secteurs[0]}</>
                      )}
                    </p>
                  </div>
                  {e.numStand && (
                    <span className="shrink-0 text-xs font-bold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full">
                      Stand {e.numStand}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500 italic">
              Parcourez les exposants et ajoutez ceux que vous souhaitez rencontrer.
            </p>
          )}
        </div>

        {/* Infos pratiques */}
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-700 space-y-1">
          <p className="font-semibold text-neutral-900 mb-2">Infos pratiques</p>
          <p>📍 CO&apos;Met d&apos;Orléans — 15 octobre 2026</p>
          <p>🎟️ Entrée libre et gratuite</p>
          <p>🕐 Ouverture au public : 9h00 – 17h00</p>
        </div>
      </main>
    </>
  );
}
