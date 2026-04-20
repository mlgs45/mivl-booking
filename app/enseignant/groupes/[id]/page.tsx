import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { AnnulerParcoursForm } from "./annuler-parcours-form";
import type { NiveauGroupe } from "@prisma/client";

export const metadata = { title: "Groupe — MIVL Booking" };

const NIVEAU_LABELS: Record<NiveauGroupe, string> = {
  QUATRIEME: "4e",
  TROISIEME: "3e",
  SECONDE: "2nde",
};

export default async function GroupeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  const { id } = await params;

  const groupe = await db.groupe.findUnique({
    where: { id },
    include: {
      enseignant: { select: { userId: true } },
      rendezVous: {
        where: { statut: { not: "ANNULE" } },
        include: {
          creneau: {
            select: {
              debut: true,
              fin: true,
              exposant: {
                select: {
                  id: true,
                  raisonSociale: true,
                  ville: true,
                  numStand: true,
                  emplacement: true,
                },
              },
            },
          },
        },
        orderBy: { creneau: { debut: "asc" } },
      },
    },
  });

  if (!groupe) notFound();
  if (groupe.enseignant.userId !== session.user.id) redirect("/enseignant");

  const hasParcours = groupe.rendezVous.length > 0;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/enseignant" className="hover:text-primary">Mes groupes</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{groupe.nom}</span>
        </div>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-heading font-bold text-neutral-900">
                {groupe.nom}
              </h1>
              <span className="text-xs bg-neutral-100 text-neutral-700 font-medium px-2 py-0.5 rounded-full">
                {NIVEAU_LABELS[groupe.niveau]}
              </span>
            </div>
            <p className="text-sm text-neutral-700">
              {groupe.tailleEffective} élève{groupe.tailleEffective > 1 ? "s" : ""}
              {groupe.creneauArrivee && ` · arrivée ${groupe.creneauArrivee}`}
            </p>
          </div>
        </div>

        {hasParcours ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-success/30 bg-success/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-success font-bold">✓</span>
                <h2 className="font-heading font-bold text-neutral-900">
                  Parcours confirmé
                </h2>
              </div>
              <p className="text-sm text-neutral-700">
                Les 4 rendez-vous sont bloqués pour votre groupe. Vous recevrez un QR code et la liste des stands par email.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Parcours du matin
              </h2>
              <ol className="space-y-2">
                {groupe.rendezVous.map((rdv, i) => {
                  const debut = new Date(rdv.creneau.debut);
                  const fin = new Date(rdv.creneau.fin);
                  const heure = `${debut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${fin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
                  return (
                    <li
                      key={rdv.id}
                      className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4"
                    >
                      <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">
                          {rdv.creneau.exposant.raisonSociale}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {rdv.creneau.exposant.ville}
                          {rdv.creneau.exposant.emplacement && ` · ${rdv.creneau.exposant.emplacement}`}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-neutral-900">{heure}</div>
                        {rdv.creneau.exposant.numStand && (
                          <div className="text-xs text-neutral-500">Stand {rdv.creneau.exposant.numStand}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <AnnulerParcoursForm groupeId={groupe.id} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <h2 className="font-heading font-bold text-neutral-900 mb-2">
              Parcours à planifier
            </h2>
            <p className="text-neutral-700 mb-5 max-w-md mx-auto">
              Choisissez 4 exposants pour votre groupe. Nous attribuerons automatiquement les créneaux à partir de {groupe.creneauArrivee}.
            </p>
            <Link
              href={`/enseignant/groupes/${groupe.id}/reserver`}
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Réserver le parcours →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
