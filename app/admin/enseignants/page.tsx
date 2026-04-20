import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import type { StatutEnseignant, NiveauGroupe } from "@prisma/client";

export const metadata = { title: "Enseignants — Admin MIVL" };

const STATUT_CONFIG: Record<
  StatutEnseignant,
  { label: string; dot: string; row: string }
> = {
  SOUMIS: { label: "À traiter", dot: "bg-primary animate-pulse", row: "bg-primary/3" },
  VALIDE: { label: "Validé", dot: "bg-success", row: "" },
  REFUSE: { label: "Refusé", dot: "bg-danger", row: "" },
};

const STATUT_ORDER: StatutEnseignant[] = ["SOUMIS", "REFUSE", "VALIDE"];

const NIVEAU_LABELS: Record<NiveauGroupe, string> = {
  QUATRIEME: "4e",
  TROISIEME: "3e",
  SECONDE: "2nde",
};

export default async function AdminEnseignantsPage({
  searchParams,
}: {
  searchParams: Promise<{ valide?: string; refuse?: string; statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const params = await searchParams;

  const filterStatut = params.statut as StatutEnseignant | undefined;

  const [enseignants, counts] = await Promise.all([
    db.enseignant.findMany({
      where: filterStatut ? { statut: filterStatut } : undefined,
      select: {
        id: true,
        prenom: true,
        nom: true,
        etablissement: true,
        ville: true,
        niveau: true,
        statut: true,
        user: { select: { email: true } },
        updatedAt: true,
        _count: { select: { groupes: true } },
      },
      orderBy: [{ statut: "asc" }, { updatedAt: "desc" }],
    }),
    db.enseignant.groupBy({ by: ["statut"], _count: { _all: true } }),
  ]);

  const countByStatut = Object.fromEntries(
    counts.map((c) => [c.statut, c._count._all]),
  ) as Partial<Record<StatutEnseignant, number>>;

  const total = enseignants.length;
  const soumisCount = countByStatut.SOUMIS ?? 0;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-700 mb-1">
              <Link href="/admin" className="hover:text-primary">Admin</Link>
              <span>/</span>
              <span className="text-neutral-900 font-medium">Enseignants</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              Enseignants
            </h1>
          </div>
          {soumisCount > 0 && (
            <div className="bg-primary text-white rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold">{soumisCount}</div>
              <div className="text-xs text-white/80">à traiter</div>
            </div>
          )}
        </div>

        {params.valide && (
          <div className="mb-4 rounded-lg border border-success/30 bg-success/10 text-success p-3 text-sm">
            ✓ <strong>{params.valide}</strong> validé — email envoyé.
          </div>
        )}
        {params.refuse && (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 text-danger p-3 text-sm">
            ✗ <strong>{params.refuse}</strong> refusé — email envoyé.
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <FilterLink href="/admin/enseignants" active={!filterStatut} label="Tous" count={total} />
          {STATUT_ORDER.map((s) => (
            <FilterLink
              key={s}
              href={`/admin/enseignants?statut=${s}`}
              active={filterStatut === s}
              label={STATUT_CONFIG[s].label}
              count={countByStatut[s] ?? 0}
              highlight={s === "SOUMIS" && (countByStatut.SOUMIS ?? 0) > 0}
            />
          ))}
        </div>

        {enseignants.length === 0 ? (
          <div className="text-center py-20 text-neutral-700">
            <p>Aucun enseignant dans cette catégorie.</p>
          </div>
        ) : (
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Enseignant</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden md:table-cell">Établissement</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Niveau</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden lg:table-cell">Groupes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {enseignants.map((e) => {
                  const cfg = STATUT_CONFIG[e.statut];
                  return (
                    <tr key={e.id} className={`hover:bg-neutral-50 transition-colors ${cfg.row}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">
                          {e.prenom} {e.nom}
                        </div>
                        <div className="text-xs text-neutral-500">{e.user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 hidden md:table-cell">
                        <div>{e.etablissement}</div>
                        <div className="text-xs text-neutral-500">{e.ville}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 hidden sm:table-cell">
                        {e.niveau ? NIVEAU_LABELS[e.niveau] : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-neutral-700">{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 hidden lg:table-cell">
                        {e._count.groupes}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/enseignants/${e.id}`}
                          className="text-primary text-sm font-medium hover:underline underline-offset-2"
                        >
                          Voir →
                        </Link>
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
  href, active, label, count, highlight,
}: {
  href: string; active: boolean; label: string; count: number; highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : highlight
            ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"}`}>
        {count}
      </span>
    </Link>
  );
}
