import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { AnnulerRdvForm } from "./annuler-rdv-form";
import { getVisitorContext } from "./actions";

export const metadata = { title: "Mon speed dating — MIVL Booking" };

const MAX_RDVS = 6;

export default async function VisiteurDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const ctx = await getVisitorContext();
  if (!ctx) {
    return (
      <>
        <AppHeader session={session} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Profil introuvable
          </h1>
          <p className="text-neutral-700">
            Votre compte n'est pas associé à un profil visiteur valide.
          </p>
        </main>
      </>
    );
  }

  const rdvs = await db.rendezVous.findMany({
    where: {
      ...(ctx.type === "JEUNE" ? { jeuneId: ctx.id } : { demandeurEmploiId: ctx.id }),
      statut: { not: "ANNULE" },
    },
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
  });

  const remaining = MAX_RDVS - rdvs.length;
  const canBookMore = remaining > 0;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Bonjour {ctx.prenom}
          </h1>
          <p className="text-sm text-neutral-700">
            Salon Made In Val de Loire · 15 octobre 2026, CO'Met Orléans
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard label="Rendez-vous confirmés" value={rdvs.length} accent="primary" />
          <StatCard label="Places restantes" value={remaining} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-neutral-900">
            Mes rendez-vous
          </h2>
          {canBookMore && (
            <Link
              href="/visiteur/reserver"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {rdvs.length === 0 ? "+ Choisir mes exposants" : "+ Ajouter un RDV"}
            </Link>
          )}
        </div>

        {rdvs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="text-neutral-700 mb-4 max-w-md mx-auto">
              Vous n'avez pas encore réservé de rendez-vous. Choisissez jusqu'à 6 exposants pour des speed datings de 5 minutes l'après-midi.
            </p>
            <Link
              href="/visiteur/reserver"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Découvrir les exposants →
            </Link>
          </div>
        ) : (
          <ol className="space-y-3">
            {rdvs.map((rdv) => {
              const debut = new Date(rdv.creneau.debut);
              const fin = new Date(rdv.creneau.fin);
              const heure = `${debut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${fin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
              const isPast = debut < new Date();
              return (
                <li
                  key={rdv.id}
                  className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4"
                >
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
                    {!isPast && (
                      <div className="mt-1">
                        <AnnulerRdvForm rdvId={rdv.id} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}

function StatCard({
  label, value, accent,
}: { label: string; value: number; accent?: "primary" }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4">
      <div className={`text-2xl font-bold font-heading ${accent === "primary" ? "text-primary" : "text-neutral-900"}`}>
        {value}
      </div>
      <div className="text-xs text-neutral-700 mt-0.5">{label}</div>
    </div>
  );
}
