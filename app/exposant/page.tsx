import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import type { StatutExposant } from "@prisma/client";

export const metadata = { title: "Espace exposant — MIVL Connect" };

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

export default async function ExposantDashboard({
  searchParams,
}: {
  searchParams: Promise<{ soumis?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const params = await searchParams;
  const justSoumis = params.soumis === "1";

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      raisonSociale: true,
      statut: true,
      motifRefus: true,
      ville: true,
      numStand: true,
      emplacement: true,
      _count: { select: { membresStand: true, creneaux: true } },
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

        {justSoumis && (
          <div className="rounded-xl border border-success/30 bg-success/10 text-success p-4 mb-4 text-sm">
            ✅ Votre profil a été soumis à la CCI. Vous recevrez un email dès
            qu'une décision sera prise.
          </div>
        )}

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

        {(exposant.statut === "BROUILLON" || exposant.statut === "REFUSE") && (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
            <h2 className="font-heading font-bold text-neutral-900 mb-2">
              {exposant.statut === "REFUSE"
                ? "Modifier et resoumettre votre profil"
                : "Compléter votre fiche"}
            </h2>
            <p className="text-sm text-neutral-700 mb-4">
              Renseignez votre secteur, vos offres, ce que vous présentez sur
              le stand et vos animations. Vous pouvez enregistrer en brouillon
              et revenir plus tard.
            </p>
            <Link
              href="/exposant/profil"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {exposant.statut === "REFUSE"
                ? "Modifier mon profil →"
                : "Compléter mon profil →"}
            </Link>
          </div>
        )}

        {exposant.statut === "SOUMIS" && (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
            <h2 className="font-heading font-bold text-neutral-900 mb-2">
              Consulter mon profil
            </h2>
            <p className="text-sm text-neutral-700 mb-4">
              Votre profil n'est plus modifiable tant que la CCI ne l'a pas
              traité. Vous pouvez le relire ci-dessous.
            </p>
            <Link
              href="/exposant/profil"
              className="inline-block bg-white border border-neutral-100 hover:bg-neutral-50 text-neutral-900 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Consulter mon profil →
            </Link>
          </div>
        )}

        {exposant.statut === "VALIDE" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/exposant/stand"
              className="block rounded-xl border border-neutral-100 bg-white p-6 hover:border-primary/30 hover:bg-primary/3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="font-heading font-bold text-neutral-900">
                  Mon stand
                </h2>
                {exposant.numStand && (
                  <span className="shrink-0 text-xs bg-primary text-white font-semibold px-2 py-0.5 rounded-full">
                    {exposant.numStand}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-700">
                {exposant.emplacement ?? "Emplacement à venir"} ·{" "}
                {exposant._count.membresStand} membre
                {exposant._count.membresStand > 1 ? "s" : ""}
              </p>
            </Link>
            <Link
              href="/exposant/profil"
              className="block rounded-xl border border-neutral-100 bg-white p-6 hover:border-primary/30 hover:bg-primary/3 transition-colors"
            >
              <h2 className="font-heading font-bold text-neutral-900 mb-1">
                Mon profil entreprise
              </h2>
              <p className="text-sm text-neutral-700">
                Relire ou mettre à jour vos informations validées.
              </p>
            </Link>
            <Link
              href="/exposant/rdv"
              className="block rounded-xl border border-neutral-100 bg-white p-6 hover:border-primary/30 hover:bg-primary/3 transition-colors sm:col-span-2 lg:col-span-1"
            >
              <h2 className="font-heading font-bold text-neutral-900 mb-1">
                Mes rendez-vous
              </h2>
              <p className="text-sm text-neutral-700">
                Groupes scolaires le matin, speed datings l'après-midi.
              </p>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
