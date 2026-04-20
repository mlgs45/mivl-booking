import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { AutoRefresh } from "@/components/live/auto-refresh";
import { AnnulerForm } from "./annuler-form";
import type { StatutRdv, TypeCreneau } from "@prisma/client";

export const metadata = { title: "Mes rendez-vous — MIVL Connect" };

export const dynamic = "force-dynamic";

const STATUT_CONFIG: Record<StatutRdv, { label: string; classes: string }> = {
  CONFIRME:  { label: "Confirmé",  classes: "bg-primary/10 text-primary" },
  PRESENT:   { label: "Présent",   classes: "bg-success/10 text-success" },
  ABSENT:    { label: "Absent",    classes: "bg-neutral-100 text-neutral-500" },
  ANNULE:    { label: "Annulé",    classes: "bg-danger/10 text-danger" },
};

export default async function ExposantRdvPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true, raisonSociale: true },
  });
  if (!exposant || exposant.statut !== "VALIDE") redirect("/exposant");

  const params = await searchParams;
  const filterType = params.type as TypeCreneau | undefined;

  const [rdvs, annules, walkIns] = await Promise.all([
    db.rendezVous.findMany({
      where: {
        creneau: {
          exposantId: exposant.id,
          ...(filterType ? { type: filterType } : {}),
        },
        statut: { not: "ANNULE" },
      },
      include: {
        creneau: { select: { debut: true, fin: true, type: true, ressourceIndex: true } },
        groupe: {
          select: {
            nom: true,
            niveau: true,
            tailleEffective: true,
            arriveAuSalonA: true,
            enseignant: { select: { prenom: true, nom: true, etablissement: true } },
          },
        },
        jeune: { select: { prenom: true, nom: true, niveauEtudes: true, arriveAuSalonA: true } },
        demandeurEmploi: { select: { prenom: true, nom: true, arriveAuSalonA: true } },
      },
      orderBy: [{ creneau: { debut: "asc" } }, { creneau: { ressourceIndex: "asc" } }],
    }),
    db.rendezVous.count({
      where: { creneau: { exposantId: exposant.id }, statut: "ANNULE" },
    }),
    db.scanEntreeStand.findMany({
      where: { exposantId: exposant.id, rendezVousId: null },
      orderBy: { scanneA: "desc" },
      select: {
        id: true,
        scanneA: true,
        profilScanne: true,
        walkInPrenom: true,
        walkInNom: true,
        walkInProfil: true,
      },
    }),
  ]);

  const matinRdvs  = rdvs.filter((r) => r.creneau.type === "GROUPE_MATIN");
  const apremRdvs  = rdvs.filter((r) => r.creneau.type === "SPEED_DATING");
  const now        = new Date();

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/exposant" className="hover:text-primary">Mon espace</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Mes rendez-vous</span>
        </div>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              Mes rendez-vous
            </h1>
            <p className="text-sm text-neutral-700 mt-1">
              Salon du 15 octobre 2026 — {exposant.raisonSociale}
            </p>
            <div className="mt-2">
              <AutoRefresh intervalSec={30} label="Live · refresh 30s" />
            </div>
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <Link
              href="/exposant/scan"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4v4H4V4zm0 8h4v4H4v-4zm8-8h4v4h-4V4zm8 0v4h-4V4h4zm-8 8v8m4-4h4m-8 4h4m-4-4h-4" />
              </svg>
              Scanner un visiteur
            </Link>
            {rdvs.length > 0 && (
              <Link
                href="/exposant/rdv/imprimer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-neutral-200 hover:border-primary hover:text-primary text-neutral-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Exporter PDF
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Groupes confirmés"  value={matinRdvs.length} accent="primary" />
          <StatCard label="Speed datings"       value={apremRdvs.length} />
          <StatCard label="Total visiteurs (matin)"
            value={matinRdvs.reduce((s, r) => s + (r.groupe?.tailleEffective ?? 0), 0)} />
          <StatCard label="Annulés"             value={annules} muted />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <FilterPill href="/exposant/rdv"                 active={!filterType}                     label="Tous"          count={rdvs.length} />
          <FilterPill href="/exposant/rdv?type=GROUPE_MATIN"  active={filterType === "GROUPE_MATIN"}  label="Matin (groupes)" count={matinRdvs.length} />
          <FilterPill href="/exposant/rdv?type=SPEED_DATING"  active={filterType === "SPEED_DATING"}  label="Après-midi"    count={apremRdvs.length} />
        </div>

        {rdvs.length === 0 ? (
          <div className="text-center py-20 text-neutral-700">
            <p>Aucun rendez-vous dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(!filterType || filterType === "GROUPE_MATIN") && matinRdvs.length > 0 && (
              <RdvGroup title="Matin — Groupes scolaires" rdvs={matinRdvs} now={now} />
            )}
            {(!filterType || filterType === "SPEED_DATING") && apremRdvs.length > 0 && (
              <RdvGroup title="Après-midi — Speed datings" rdvs={apremRdvs} now={now} />
            )}
          </div>
        )}

        {walkIns.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Walk-ins ({walkIns.length})
            </h2>
            <div className="border border-neutral-100 rounded-xl overflow-hidden bg-white">
              <ul className="divide-y divide-neutral-100">
                {walkIns.map((w) => {
                  const nom =
                    [w.walkInPrenom, w.walkInNom].filter(Boolean).join(" ") ||
                    (w.profilScanne === "WALK_IN" && !w.walkInPrenom && !w.walkInNom
                      ? "Walk-in (badge scanné)"
                      : "Walk-in anonyme");
                  return (
                    <li key={w.id} className="p-3 text-sm flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{nom}</p>
                        {w.walkInProfil && (
                          <p className="text-xs text-neutral-500 truncate">{w.walkInProfil}</p>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 tabular-nums shrink-0">
                        {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(w.scanneA)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

type RdvWithRelations = Awaited<
  ReturnType<typeof db.rendezVous.findMany<{
    include: {
      creneau: { select: { debut: true; fin: true; type: true; ressourceIndex: true } };
      groupe: {
        select: {
          nom: true; niveau: true; tailleEffective: true; arriveAuSalonA: true;
          enseignant: { select: { prenom: true; nom: true; etablissement: true } };
        };
      };
      jeune: { select: { prenom: true; nom: true; niveauEtudes: true; arriveAuSalonA: true } };
      demandeurEmploi: { select: { prenom: true; nom: true; arriveAuSalonA: true } };
    };
  }>>
>[number];

function RdvGroup({ title, rdvs, now }: { title: string; rdvs: RdvWithRelations[]; now: Date }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">{title}</h2>
      <div className="border border-neutral-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Horaire</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Visiteur</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden md:table-cell">Détails</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rdvs.map((r) => <RdvRow key={r.id} rdv={r} now={now} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RdvRow({ rdv, now }: { rdv: RdvWithRelations; now: Date }) {
  const cfg    = STATUT_CONFIG[rdv.statut];
  const isPast = rdv.creneau.debut < now;
  const canCancel = rdv.statut === "CONFIRME" && !isPast;

  const debut = new Date(rdv.creneau.debut);
  const fin   = new Date(rdv.creneau.fin);
  const heure = `${debut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${fin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

  let visitorName = "";
  let visitorDetail = "";
  let arriveAuSalonA: Date | null = null;
  if (rdv.groupe) {
    visitorName   = `${rdv.groupe.nom} (${rdv.groupe.tailleEffective} élèves)`;
    visitorDetail = `${rdv.groupe.enseignant.etablissement} — ${rdv.groupe.enseignant.prenom} ${rdv.groupe.enseignant.nom}`;
    arriveAuSalonA = rdv.groupe.arriveAuSalonA;
  } else if (rdv.jeune) {
    visitorName   = `${rdv.jeune.prenom} ${rdv.jeune.nom}`;
    visitorDetail = rdv.jeune.niveauEtudes;
    arriveAuSalonA = rdv.jeune.arriveAuSalonA;
  } else if (rdv.demandeurEmploi) {
    visitorName   = `${rdv.demandeurEmploi.prenom} ${rdv.demandeurEmploi.nom}`;
    visitorDetail = "Demandeur d'emploi";
    arriveAuSalonA = rdv.demandeurEmploi.arriveAuSalonA;
  }

  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3 text-neutral-900 font-medium whitespace-nowrap">{heure}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-neutral-900">{visitorName}</span>
          {arriveAuSalonA && rdv.statut !== "PRESENT" && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              ● Au salon
            </span>
          )}
        </div>
        <div className="text-xs text-neutral-500 md:hidden">{visitorDetail}</div>
      </td>
      <td className="px-4 py-3 text-neutral-700 hidden md:table-cell">{visitorDetail}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
          {cfg.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {canCancel && <AnnulerForm rdvId={rdv.id} />}
      </td>
    </tr>
  );
}

function StatCard({
  label, value, accent, muted,
}: {
  label: string; value: number; accent?: "primary"; muted?: boolean;
}) {
  const valueClass = muted ? "text-neutral-500" : accent === "primary" ? "text-primary" : "text-neutral-900";
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4">
      <div className={`text-2xl font-bold font-heading ${valueClass}`}>{value}</div>
      <div className="text-xs text-neutral-700 mt-0.5">{label}</div>
    </div>
  );
}

function FilterPill({
  href, active, label, count,
}: {
  href: string; active: boolean; label: string; count: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-primary text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"}`}>
        {count}
      </span>
    </Link>
  );
}
