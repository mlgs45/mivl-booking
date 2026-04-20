import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import type { NiveauGroupe } from "@prisma/client";

export const metadata = { title: "Espace enseignant — MIVL Booking" };

const NIVEAU_LABELS: Record<NiveauGroupe, string> = {
  QUATRIEME: "4e",
  TROISIEME: "3e",
  SECONDE: "2nde",
};

export default async function EnseignantDashboard() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  const enseignant = await db.enseignant.findUnique({
    where: { userId: session.user.id },
    include: {
      groupes: {
        orderBy: { createdAt: "asc" },
        include: {
          rendezVous: {
            where: { statut: { not: "ANNULE" } },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!enseignant) {
    return (
      <>
        <AppHeader session={session} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Profil introuvable
          </h1>
          <p className="text-neutral-700">
            Aucune fiche enseignant n'est associée à votre compte.
          </p>
        </main>
      </>
    );
  }

  const groupes = enseignant.groupes;
  const nbAvecParcours = groupes.filter((g) => g.rendezVous.length > 0).length;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Bonjour {enseignant.prenom}
          </h1>
          <p className="text-sm text-neutral-700">
            {enseignant.etablissement} · {enseignant.ville}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Groupes" value={groupes.length} />
          <StatCard label="Avec parcours confirmé" value={nbAvecParcours} accent="primary" />
          <StatCard
            label="Élèves au total"
            value={groupes.reduce((s, g) => s + g.tailleEffective, 0)}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-neutral-900">
            Mes groupes
          </h2>
          <Link
            href="/enseignant/groupes/nouveau"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nouveau groupe
          </Link>
        </div>

        {groupes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="text-neutral-700 mb-4">
              Vous n'avez pas encore créé de groupe. Commencez par créer un premier groupe pour pouvoir réserver son parcours de 4 rendez-vous.
            </p>
            <Link
              href="/enseignant/groupes/nouveau"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Créer mon premier groupe →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groupes.map((g) => {
              const hasParcours = g.rendezVous.length > 0;
              return (
                <Link
                  key={g.id}
                  href={`/enseignant/groupes/${g.id}`}
                  className="block rounded-xl border border-neutral-100 bg-white p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-neutral-900">
                          {g.nom}
                        </h3>
                        <span className="text-xs bg-neutral-100 text-neutral-700 font-medium px-2 py-0.5 rounded-full">
                          {NIVEAU_LABELS[g.niveau]}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700">
                        {g.tailleEffective} élève{g.tailleEffective > 1 ? "s" : ""}
                        {g.creneauArrivee && ` · arrivée ${g.creneauArrivee}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {hasParcours ? (
                        <span className="inline-block text-xs bg-success/10 text-success font-semibold px-2.5 py-1 rounded-full">
                          ✓ Parcours confirmé
                        </span>
                      ) : (
                        <span className="inline-block text-xs bg-accent/20 text-neutral-900 font-semibold px-2.5 py-1 rounded-full">
                          À planifier
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
