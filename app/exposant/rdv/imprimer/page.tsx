import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AutoPrint } from "./auto-print";

export const metadata = {
  title: "Planning à imprimer — MIVL Connect",
};

export default async function ExposantPlanningImprimerPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      statut: true,
      raisonSociale: true,
      numStand: true,
      emplacement: true,
    },
  });
  if (!exposant) notFound();
  if (exposant.statut !== "VALIDE") redirect("/exposant");

  const rdvs = await db.rendezVous.findMany({
    where: {
      creneau: { exposantId: exposant.id },
      statut: { in: ["CONFIRME", "PRESENT"] },
    },
    include: {
      creneau: { select: { debut: true, fin: true, type: true, ressourceIndex: true } },
      groupe: {
        select: {
          nom: true,
          niveau: true,
          tailleEffective: true,
          enseignant: { select: { prenom: true, nom: true, etablissement: true } },
        },
      },
      jeune: { select: { prenom: true, nom: true, niveauEtudes: true } },
      demandeurEmploi: { select: { prenom: true, nom: true, agencePoleEmploi: true } },
    },
    orderBy: [
      { creneau: { debut: "asc" } },
      { creneau: { ressourceIndex: "asc" } },
    ],
  });

  const matin = rdvs.filter((r) => r.creneau.type === "GROUPE_MATIN");
  const aprem = rdvs.filter((r) => r.creneau.type === "SPEED_DATING");
  const totalVisiteursMatin = matin.reduce(
    (s, r) => s + (r.groupe?.tailleEffective ?? 0),
    0,
  );

  const printedAt = new Date().toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <AutoPrint />
      <main className="print-page bg-white text-neutral-900 max-w-[210mm] mx-auto px-10 py-8 print:px-0 print:py-0">
        <header className="flex items-start justify-between gap-6 pb-5 mb-6 border-b-2 border-primary">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/images/logo-mivl.png"
                alt="Made In Val de Loire"
                width={56}
                height={56}
                className="object-contain"
              />
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  Made In Val de Loire 2026
                </div>
                <div className="text-sm text-neutral-700">
                  Jeudi 15 octobre 2026 — CO&#39;Met Orléans
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-heading font-bold">
              Planning du stand — {exposant.raisonSociale}
            </h1>
            {(exposant.numStand || exposant.emplacement) && (
              <p className="text-sm text-neutral-700 mt-1">
                {exposant.numStand && <strong>Stand {exposant.numStand}</strong>}
                {exposant.numStand && exposant.emplacement && " · "}
                {exposant.emplacement}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-neutral-500 shrink-0 pt-1">
            Édité le<br />
            {printedAt}
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3 mb-8">
          <StatBlock label="Groupes (matin)" value={matin.length} />
          <StatBlock label="Speed datings (après-midi)" value={aprem.length} />
          <StatBlock label="Élèves à accueillir (matin)" value={totalVisiteursMatin} />
        </section>

        {matin.length > 0 && (
          <Section title="Matin — Groupes scolaires (9h – 12h)">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-left">
                  <th className="py-2 pr-3 font-semibold w-[22%]">Horaire</th>
                  <th className="py-2 pr-3 font-semibold w-[22%]">Groupe</th>
                  <th className="py-2 pr-3 font-semibold">Établissement · Référent</th>
                  <th className="py-2 pr-3 font-semibold w-[12%]">Élèves</th>
                </tr>
              </thead>
              <tbody>
                {matin.map((r) => {
                  const g = r.groupe;
                  if (!g) return null;
                  return (
                    <tr key={r.id} className="border-b border-neutral-200 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap font-medium">
                        {formatHoraire(r.creneau.debut, r.creneau.fin)}
                      </td>
                      <td className="py-2 pr-3">
                        {g.nom}{" "}
                        <span className="text-xs text-neutral-500">
                          · {labelNiveau(g.niveau)}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div>{g.enseignant.etablissement}</div>
                        <div className="text-xs text-neutral-500">
                          {g.enseignant.prenom} {g.enseignant.nom}
                        </div>
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {g.tailleEffective}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {aprem.length > 0 && (
          <Section
            title="Après-midi — Speed datings (14h – 18h)"
            breakBefore={matin.length > 0}
          >
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-left">
                  <th className="py-2 pr-3 font-semibold w-[22%]">Horaire</th>
                  <th className="py-2 pr-3 font-semibold">Visiteur</th>
                  <th className="py-2 pr-3 font-semibold">Profil</th>
                </tr>
              </thead>
              <tbody>
                {aprem.map((r) => {
                  const name =
                    r.jeune
                      ? `${r.jeune.prenom} ${r.jeune.nom}`
                      : r.demandeurEmploi
                        ? `${r.demandeurEmploi.prenom} ${r.demandeurEmploi.nom}`
                        : "—";
                  const profil =
                    r.jeune
                      ? r.jeune.niveauEtudes
                      : r.demandeurEmploi
                        ? `Demandeur d'emploi${r.demandeurEmploi.agencePoleEmploi ? ` · ${r.demandeurEmploi.agencePoleEmploi}` : ""}`
                        : "";
                  return (
                    <tr key={r.id} className="border-b border-neutral-200 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap font-medium">
                        {formatHoraire(r.creneau.debut, r.creneau.fin)}
                      </td>
                      <td className="py-2 pr-3">{name}</td>
                      <td className="py-2 pr-3 text-neutral-700">{profil}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {rdvs.length === 0 && (
          <div className="py-12 text-center text-neutral-500 italic">
            Aucun rendez-vous planifié pour le moment.
          </div>
        )}

        <footer className="mt-10 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
          CCI Centre-Val de Loire · Salon Made In Val de Loire 2026 · mivl-orleans.fr
        </footer>
      </main>

      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }
        @media print {
          body { background: white !important; }
          header, .page-break-before { break-inside: avoid; }
          tr, thead, tbody { break-inside: avoid; }
        }
      `}</style>
    </>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-200 rounded-lg px-4 py-3">
      <div className="text-2xl font-heading font-bold text-primary">{value}</div>
      <div className="text-xs text-neutral-700 mt-0.5">{label}</div>
    </div>
  );
}

function Section({
  title,
  children,
  breakBefore,
}: {
  title: string;
  children: React.ReactNode;
  breakBefore?: boolean;
}) {
  return (
    <section
      className={`mb-8 ${breakBefore ? "page-break-before print:[break-before:page]" : ""}`}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function formatHoraire(debut: Date, fin: Date) {
  const d = new Date(debut);
  const f = new Date(fin);
  const fmt = (x: Date) =>
    x.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(d)} – ${fmt(f)}`;
}

function labelNiveau(n: "QUATRIEME" | "TROISIEME" | "SECONDE") {
  return { QUATRIEME: "4e", TROISIEME: "3e", SECONDE: "2nde" }[n];
}
