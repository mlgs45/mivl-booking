import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { AutoRefresh } from "@/components/live/auto-refresh";

export const metadata = { title: "Jour J — Live · Admin MIVL" };

export const dynamic = "force-dynamic";

export default async function AdminLivePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE")) {
    redirect("/admin");
  }

  const [
    groupesTotal,
    groupesArrives,
    elevesTotalAgg,
    elevesArrivesAgg,
    jeunesTotal,
    jeunesArrives,
    deTotal,
    deArrives,
    rdvTotal,
    rdvPresents,
    rdvAbsents,
    walkIns,
    derniersScans,
    derniersWalkIns,
  ] = await Promise.all([
    db.groupe.count(),
    db.groupe.count({ where: { arriveAuSalonA: { not: null } } }),
    db.groupe.aggregate({ _sum: { tailleEffective: true } }),
    db.groupe.aggregate({
      _sum: { tailleEffective: true },
      where: { arriveAuSalonA: { not: null } },
    }),
    db.jeune.count(),
    db.jeune.count({ where: { arriveAuSalonA: { not: null } } }),
    db.demandeurEmploi.count(),
    db.demandeurEmploi.count({ where: { arriveAuSalonA: { not: null } } }),
    db.rendezVous.count({ where: { statut: { not: "ANNULE" } } }),
    db.rendezVous.count({ where: { statut: "PRESENT" } }),
    db.rendezVous.count({ where: { statut: "ABSENT" } }),
    db.scanEntreeStand.count({ where: { rendezVousId: null } }),
    db.scanEntreeStand.findMany({
      take: 15,
      orderBy: { scanneA: "desc" },
      include: {
        exposant: { select: { raisonSociale: true, numStand: true } },
        rendezVous: {
          include: {
            groupe: { select: { nom: true } },
            jeune: { select: { prenom: true, nom: true } },
            demandeurEmploi: { select: { prenom: true, nom: true } },
          },
        },
      },
    }),
    db.scanEntreeStand.findMany({
      where: { profilScanne: "WALK_IN" },
      take: 10,
      orderBy: { scanneA: "desc" },
      include: {
        exposant: { select: { raisonSociale: true } },
      },
    }),
  ]);

  const elevesAttendus = elevesTotalAgg._sum.tailleEffective ?? 0;
  const elevesArrives = elevesArrivesAgg._sum.tailleEffective ?? 0;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Jour J — Live</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
              Jour J — Live
            </h1>
            <AutoRefresh intervalSec={30} label="Rafraîchissement auto · 30s" />
          </div>
          <Link
            href="/admin/scan"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            Scanner l&#39;entrée →
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Présence
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <LiveCard
              label="Groupes arrivés"
              value={groupesArrives}
              total={groupesTotal}
            />
            <LiveCard
              label="Élèves au salon"
              value={elevesArrives}
              total={elevesAttendus}
              accent="primary"
            />
            <LiveCard
              label="Jeunes arrivés"
              value={jeunesArrives}
              total={jeunesTotal}
            />
            <LiveCard
              label="Demandeurs d'emploi"
              value={deArrives}
              total={deTotal}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Rendez-vous
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <LiveCard label="Total RDV actifs" value={rdvTotal} />
            <LiveCard
              label="Honorés (présents)"
              value={rdvPresents}
              total={rdvTotal}
              accent="success"
            />
            <LiveCard
              label="No-show (absents)"
              value={rdvAbsents}
              total={rdvTotal}
              accent="danger"
            />
            <LiveCard
              label="Walk-ins enregistrés"
              value={walkIns}
              accent="primary"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Derniers scans stand
            </h2>
            {derniersScans.length === 0 ? (
              <p className="text-sm text-neutral-500 italic border border-neutral-100 rounded-xl p-6 text-center bg-white">
                Aucun scan pour le moment.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-white">
                {derniersScans.map((s) => {
                  const nom =
                    s.rendezVous?.groupe?.nom ??
                    (s.rendezVous?.jeune
                      ? `${s.rendezVous.jeune.prenom} ${s.rendezVous.jeune.nom}`
                      : null) ??
                    (s.rendezVous?.demandeurEmploi
                      ? `${s.rendezVous.demandeurEmploi.prenom} ${s.rendezVous.demandeurEmploi.nom}`
                      : null) ??
                    ([s.walkInPrenom, s.walkInNom].filter(Boolean).join(" ") ||
                      "Walk-in");
                  return (
                    <li key={s.id} className="p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-neutral-900 truncate">
                          {nom}
                        </span>
                        <span className="text-xs text-neutral-500 shrink-0 tabular-nums">
                          {fmtHeure(s.scanneA)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {s.exposant.raisonSociale}
                        {s.exposant.numStand && ` · Stand ${s.exposant.numStand}`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Derniers walk-ins
            </h2>
            {derniersWalkIns.length === 0 ? (
              <p className="text-sm text-neutral-500 italic border border-neutral-100 rounded-xl p-6 text-center bg-white">
                Aucun walk-in pour le moment.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-white">
                {derniersWalkIns.map((w) => {
                  const nom =
                    [w.walkInPrenom, w.walkInNom].filter(Boolean).join(" ") ||
                    "Walk-in anonyme";
                  return (
                    <li key={w.id} className="p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-neutral-900">{nom}</span>
                        <span className="text-xs text-neutral-500 shrink-0 tabular-nums">
                          {fmtHeure(w.scanneA)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {w.walkInProfil && `${w.walkInProfil} · `}
                        {w.exposant.raisonSociale}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function LiveCard({
  label,
  value,
  total,
  accent,
}: {
  label: string;
  value: number;
  total?: number;
  accent?: "primary" | "success" | "danger";
}) {
  const color =
    accent === "primary"
      ? "text-primary"
      : accent === "success"
        ? "text-success"
        : accent === "danger"
          ? "text-danger"
          : "text-neutral-900";

  const pct = total && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-heading font-bold ${color} tabular-nums`}>
          {value}
        </span>
        {total != null && (
          <span className="text-sm text-neutral-500 tabular-nums">
            / {total}
          </span>
        )}
      </div>
      <div className="text-xs text-neutral-700 mt-1">{label}</div>
      {pct != null && (
        <div className="mt-2 h-1 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={`h-full ${
              accent === "success"
                ? "bg-success"
                : accent === "danger"
                  ? "bg-danger"
                  : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function fmtHeure(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
