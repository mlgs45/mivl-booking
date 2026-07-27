import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import type { SecteurCode } from "@/lib/referentiel/secteurs";
import type { StatutExposant } from "@prisma/client";

export const metadata = { title: "Entreprises inscrites — MIVL Connect" };

const STATUT_CONFIG: Record<StatutExposant, { label: string; dot: string }> = {
  BROUILLON: { label: "Brouillon", dot: "bg-neutral-300" },
  SOUMIS: { label: "En cours de validation", dot: "bg-primary" },
  VALIDE: { label: "Validé", dot: "bg-success" },
  REFUSE: { label: "Refusé", dot: "bg-danger" },
  LISTE_ATTENTE: { label: "Liste d'attente", dot: "bg-accent" },
};

const STATUT_ORDER: StatutExposant[] = [
  "VALIDE",
  "SOUMIS",
  "LISTE_ATTENTE",
  "BROUILLON",
  "REFUSE",
];

export default async function PartenairePage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARTENAIRE") {
    redirect("/connexion");
  }

  const params = await searchParams;
  const filterStatut = params.statut as StatutExposant | undefined;

  const [exposants, counts] = await Promise.all([
    db.exposant.findMany({
      where: filterStatut ? { statut: filterStatut } : undefined,
      select: {
        id: true,
        raisonSociale: true,
        ville: true,
        secteurs: true,
        secteurAutre: true,
        logoUrl: true,
        statut: true,
        estPartenaire: true,
        createdAt: true,
      },
      orderBy: [{ statut: "asc" }, { raisonSociale: "asc" }],
    }),
    db.exposant.groupBy({ by: ["statut"], _count: { _all: true } }),
  ]);

  const countByStatut = Object.fromEntries(
    counts.map((c) => [c.statut, c._count._all]),
  ) as Partial<Record<StatutExposant, number>>;
  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Entreprises inscrites
          </h1>
          <p className="text-sm text-neutral-700">
            Liste des entreprises exposantes inscrites au salon Made In Val de
            Loire 2026, quel que soit l'avancement de leur dossier.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <FilterLink href="/partenaire" active={!filterStatut} label="Toutes" count={total} />
          {STATUT_ORDER.map((s) => (
            <FilterLink
              key={s}
              href={`/partenaire?statut=${s}`}
              active={filterStatut === s}
              label={STATUT_CONFIG[s].label}
              count={countByStatut[s] ?? 0}
            />
          ))}
        </div>

        {exposants.length === 0 ? (
          <div className="text-center py-20 text-neutral-700">
            <p>Aucune entreprise dans cette catégorie.</p>
          </div>
        ) : (
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Entreprise</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Ville</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden md:table-cell">Secteur</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden lg:table-cell">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {exposants.map((e) => {
                  const cfg = STATUT_CONFIG[e.statut];
                  const secteurs = [
                    ...e.secteurs.map((c) => SECTEUR_LABELS[c as SecteurCode] ?? c),
                    ...(e.secteurAutre ? [e.secteurAutre] : []),
                  ];
                  const secteurLabel = secteurs[0] ?? "—";
                  const extraSecteurs = secteurs.length - 1;
                  return (
                    <tr key={e.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-md border border-neutral-100 bg-neutral-50 flex items-center justify-center overflow-hidden">
                            {e.logoUrl ? (
                              <Image
                                src={e.logoUrl}
                                alt=""
                                width={36}
                                height={36}
                                className="max-w-full max-h-full object-contain"
                                unoptimized
                              />
                            ) : (
                              <span className="text-[10px] text-neutral-400">—</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-neutral-900">{e.raisonSociale}</span>
                            {e.estPartenaire && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/30 text-neutral-900 px-2 py-0.5 rounded-full">
                                ★ Partenaire
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 hidden sm:table-cell">{e.ville}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-neutral-700">{secteurLabel}</span>
                        {extraSecteurs > 0 && (
                          <span className="ml-1 text-xs text-neutral-500">+{extraSecteurs}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-neutral-700">{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                        {new Date(e.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"}`}>
        {count}
      </span>
    </a>
  );
}
