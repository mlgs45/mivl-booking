import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { ProfilForm } from "./profil-form";

export const metadata = { title: "Mon profil exposant — MIVL Connect" };

export default async function ExposantProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: {
      raisonSociale: true,
      siret: true,
      adresse: true,
      ville: true,
      codePostal: true,
      siteWeb: true,
      nomContact: true,
      telephoneContact: true,
      fonctionContact: true,
      description: true,
      secteurs: true,
      secteurAutre: true,
      offres: true,
      typesOpportunites: true,
      metiersProposes: true,
      elementsStand: true,
      elementsStandAutre: true,
      animations: true,
      innovationMiseEnAvant: true,
      descriptionInnovation: true,
      statutRecrutement: true,
      consentementCommunication: true,
      statut: true,
    },
  });

  if (!exposant) {
    return (
      <>
        <AppHeader session={session} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Profil introuvable
          </h1>
          <p className="text-neutral-700">
            Aucune fiche exposant n'est associée à votre compte. Contactez la
            CCI pour régulariser votre situation.
          </p>
        </main>
      </>
    );
  }

  const readonly =
    exposant.statut === "VALIDE" || exposant.statut === "SOUMIS";

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link
            href="/exposant"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Mon profil exposant
          </h1>
          <p className="text-sm text-neutral-700">
            Ces informations servent à présenter votre entreprise aux visiteurs
            et à la CCI pour valider votre participation.
          </p>
        </div>

        {readonly && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            {exposant.statut === "VALIDE"
              ? "Votre profil est validé. Il n'est plus modifiable. Contactez la CCI pour tout changement."
              : "Votre profil est en cours de validation. Vous pourrez le modifier à nouveau si la CCI le renvoie en brouillon."}
          </div>
        )}

        <ProfilForm exposant={exposant} />
      </main>
    </>
  );
}
