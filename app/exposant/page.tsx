import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import type { StatutExposant } from "@prisma/client";

export const metadata = { title: "Espace exposant — MIVL Booking" };

const STATUT_CONFIG: Record<
  StatutExposant,
  { label: string; tone: "warning" | "info" | "success" | "danger"; message: string }
> = {
  BROUILLON: {
    label: "Profil incomplet",
    tone: "warning",
    message:
      "Complétez votre fiche entreprise puis soumettez-la à la CCI pour validation.",
  },
  SOUMIS: {
    label: "En attente de validation",
    tone: "info",
    message:
      "Votre candidature est en cours d'examen par la CCI. Vous serez notifié par email de la décision.",
  },
  VALIDE: {
    label: "Validé",
    tone: "success",
    message:
      "Félicitations, votre participation est confirmée. Les inscriptions visiteurs ouvrent le 1er septembre.",
  },
  REFUSE: {
    label: "Candidature refusée",
    tone: "danger",
    message:
      "Votre candidature n'a pas été retenue. Consultez le motif et, si possible, modifiez votre profil pour resoumettre.",
  },
};

const TONE_CLASSES: Record<"warning" | "info" | "success" | "danger", string> = {
  warning: "bg-accent/20 border-accent text-neutral-900",
  info: "bg-primary/10 border-primary/30 text-primary",
  success: "bg-success/10 border-success/30 text-success",
  danger: "bg-danger/10 border-danger/30 text-danger",
};

export default async function ExposantDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      raisonSociale: true,
      statut: true,
      motifRefus: true,
      ville: true,
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

  const config = STATUT_CONFIG[exposant.statut];

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            {exposant.raisonSociale}
          </h1>
          <p className="text-sm text-neutral-700">{exposant.ville}</p>
        </div>

        <div
          className={`rounded-xl border p-5 mb-8 ${TONE_CLASSES[config.tone]}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Statut
            </span>
            <span className="text-xs opacity-60">·</span>
            <span className="text-sm font-semibold">{config.label}</span>
          </div>
          <p className="text-sm leading-relaxed">{config.message}</p>
          {exposant.motifRefus && exposant.statut === "REFUSE" && (
            <div className="mt-3 pt-3 border-t border-current/20 text-sm">
              <strong className="font-semibold">Motif : </strong>
              {exposant.motifRefus}
            </div>
          )}
        </div>

        {exposant.statut === "BROUILLON" && (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
            <h2 className="font-heading font-bold text-neutral-900 mb-2">
              Compléter votre fiche
            </h2>
            <p className="text-sm text-neutral-700 mb-4">
              Le formulaire de profil entreprise (secteur, métiers, offres,
              ressources) arrive en J7.
            </p>
            <button
              type="button"
              disabled
              className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg opacity-60 cursor-not-allowed"
            >
              Compléter mon profil →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
