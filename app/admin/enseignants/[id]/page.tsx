import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { ValiderForm } from "./valider-form";
import { RefuserForm } from "./refuser-form";
import type { NiveauGroupe } from "@prisma/client";

const STATUT_CONFIG = {
  SOUMIS: { label: "En attente", classes: "bg-primary/10 text-primary" },
  VALIDE: { label: "Validé", classes: "bg-success/10 text-success" },
  REFUSE: { label: "Refusé", classes: "bg-danger/10 text-danger" },
};

const NIVEAU_LABELS: Record<NiveauGroupe, string> = {
  QUATRIEME: "4e",
  TROISIEME: "3e",
  SECONDE: "2nde",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await db.enseignant.findUnique({
    where: { id },
    select: { prenom: true, nom: true },
  });
  return { title: e ? `${e.prenom} ${e.nom} — Admin MIVL` : "Enseignant — Admin MIVL" };
}

export default async function AdminEnseignantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const { id } = await params;

  const enseignant = await db.enseignant.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, createdAt: true } },
      groupes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          nom: true,
          niveau: true,
          tailleEffective: true,
          rendezVous: {
            where: { statut: { not: "ANNULE" } },
            select: { id: true },
          },
        },
      },
    },
  });
  if (!enseignant) notFound();

  const statut = STATUT_CONFIG[enseignant.statut];
  const peutValider = enseignant.statut === "SOUMIS";

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <Link href="/admin/enseignants" className="hover:text-primary">Enseignants</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">
            {enseignant.prenom} {enseignant.nom}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              {enseignant.prenom} {enseignant.nom}
            </h1>
            <p className="text-sm text-neutral-700 mt-1">
              {enseignant.etablissement} · {enseignant.ville} ·{" "}
              {enseignant.user.email} · Inscrit le{" "}
              {new Date(enseignant.user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statut.classes}`}>
            {statut.label}
          </span>
        </div>

        {peutValider && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-heading font-semibold text-neutral-900 mb-3">
              Décision sur cette inscription
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <ValiderForm enseignantId={enseignant.id} />
              <RefuserForm enseignantId={enseignant.id} />
            </div>
          </div>
        )}

        {enseignant.statut === "REFUSE" && enseignant.motifRefus && (
          <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-5">
            <p className="text-sm font-semibold text-danger mb-1">Motif de refus</p>
            <p className="text-sm text-neutral-900">{enseignant.motifRefus}</p>
          </div>
        )}

        <div className="space-y-8">
          <Section title="Profil">
            <Row label="Matière enseignée" value={enseignant.matiere} />
            <Row label="Niveau principal" value={enseignant.niveau ? NIVEAU_LABELS[enseignant.niveau] : null} />
          </Section>

          <Section title={`Groupes (${enseignant.groupes.length})`}>
            {enseignant.groupes.length === 0 ? (
              <p className="text-sm italic text-neutral-500">Aucun groupe créé pour l&#39;instant.</p>
            ) : (
              <ul className="space-y-2">
                {enseignant.groupes.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-neutral-900">{g.nom}</span>
                    <span className="text-neutral-500">
                      {NIVEAU_LABELS[g.niveau]} · {g.tailleEffective} élèves
                    </span>
                    {g.rendezVous.length > 0 && (
                      <span className="text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">
                        ✓ Parcours confirmé
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-100 pt-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-neutral-500 w-44 shrink-0">{label}</span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}
