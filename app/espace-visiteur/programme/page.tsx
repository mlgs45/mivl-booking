import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { getRdvOuvertureConfig, isRdvOuvert } from "@/lib/rdv-ouvert";
import { SECTEUR_LABELS, SECTEUR_CODES } from "@/lib/referentiel/secteurs";
import type { SecteurCode } from "@/lib/referentiel/secteurs";
import { ProgrammeGrid } from "./programme-grid";

export const metadata = { title: "Préparer ma visite — MIVL Connect" };

export default async function ProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ secteur?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const visiteur = await db.visiteur.findUnique({
    where: { userId: session.user.id },
    select: { id: true, exposantsFavoris: true },
  });
  if (!visiteur) redirect("/connexion");

  const rdvConfig = await getRdvOuvertureConfig();
  if (!isRdvOuvert(rdvConfig)) {
    return (
      <>
        <AppHeader session={session} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-4xl mb-4">🔒</p>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">
              La sélection n'est pas encore ouverte
            </h1>
            <p className="text-neutral-600 text-sm mb-2">
              {rdvConfig.ouvertureRdvAt
                ? `Ouverture prévue le ${rdvConfig.ouvertureRdvAt.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}.`
                : "La date d'ouverture sera communiquée prochainement."}
            </p>
            <p className="text-neutral-500 text-sm mb-6">
              Tous les visiteurs pourront préparer leur programme en même temps dès l'ouverture.
            </p>
            <Link href="/espace-visiteur" className="text-primary hover:underline underline-offset-2 text-sm font-medium">
              ← Retour à mon espace
            </Link>
          </div>
        </main>
      </>
    );
  }

  const sp = await searchParams;

  const exposants = await db.exposant.findMany({
    where: {
      statut: "VALIDE",
      ...(sp.secteur ? { secteurs: { has: sp.secteur } } : {}),
    },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      secteurs: true,
      description: true,
      numStand: true,
    },
    orderBy: { raisonSociale: "asc" },
  });

  const secteurs = SECTEUR_CODES.map((code) => ({
    code,
    label: SECTEUR_LABELS[code as SecteurCode] ?? code,
  }));

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/espace-visiteur" className="hover:text-primary">Mon espace</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Préparer ma visite</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Choisissez vos entreprises à voir
          </h1>
          <p className="text-sm text-neutral-700">
            Sélectionnez les stands que vous souhaitez visiter. Votre programme est sauvegardé automatiquement.
          </p>
        </div>

        {/* Filtres secteur */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/espace-visiteur/programme"
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              !sp.secteur
                ? "bg-primary text-white border-primary"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-primary"
            }`}
          >
            Tous les secteurs
          </Link>
          {secteurs.map((s) => (
            <Link
              key={s.code}
              href={`/espace-visiteur/programme?secteur=${s.code}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                sp.secteur === s.code
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-primary"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <ProgrammeGrid exposants={exposants} favoris={visiteur.exposantsFavoris} />
      </main>
    </>
  );
}
