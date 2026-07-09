import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { RefuserForm } from "./refuser-form";
import { ValiderForm } from "./valider-form";
import { AttribuerStandForm } from "./attribuer-stand-form";
import { PartenaireToggle } from "./partenaire-toggle";
import { SupprimerForm } from "./supprimer-form";
import { RemettreEnAttenteForm } from "./remettre-en-attente-form";
import { modifierProfilAdmin } from "./actions";
import { televerserLogoAdmin, supprimerLogoAdmin } from "./logo-actions";
import { ProfilForm } from "@/app/exposant/profil/profil-form";
import { LogoUpload } from "@/app/exposant/profil/logo-upload";

const STATUT_CONFIG = {
  BROUILLON: { label: "Brouillon", classes: "bg-neutral-100 text-neutral-700" },
  SOUMIS: { label: "En attente", classes: "bg-primary/10 text-primary" },
  VALIDE: { label: "Validé", classes: "bg-success/10 text-success" },
  REFUSE: { label: "Refusé", classes: "bg-danger/10 text-danger" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await db.exposant.findUnique({ where: { id }, select: { raisonSociale: true } });
  return { title: `${e?.raisonSociale ?? "Exposant"} — Admin MIVL` };
}

export default async function AdminExposantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE")) {
    redirect("/admin");
  }
  const { id } = await params;

  const exposant = await db.exposant.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      membresStand: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!exposant) notFound();

  const statut = STATUT_CONFIG[exposant.statut];
  const peutValider = exposant.statut === "SOUMIS";

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <Link href="/admin/exposants" className="hover:text-primary">Exposants</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{exposant.raisonSociale}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              {exposant.raisonSociale}
            </h1>
            <p className="text-sm text-neutral-700 mt-1">
              {exposant.ville}{exposant.codePostal ? ` (${exposant.codePostal})` : ""} ·{" "}
              {exposant.user.email} · Inscrit le{" "}
              {new Date(exposant.user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {exposant.estPartenaire && (
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-accent/30 text-neutral-900">
                Partenaire
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statut.classes}`}>
              {statut.label}
            </span>
          </div>
        </div>

        {/* Actions de validation (sticky en bas) */}
        {peutValider && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-heading font-semibold text-neutral-900 mb-3">
              Décision sur cette candidature
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <ValiderForm exposantId={exposant.id} />
              <RefuserForm exposantId={exposant.id} />
            </div>
          </div>
        )}

        {exposant.statut === "REFUSE" && exposant.motifRefus && (
          <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-5">
            <p className="text-sm font-semibold text-danger mb-1">Motif de refus</p>
            <p className="text-sm text-neutral-900">{exposant.motifRefus}</p>
          </div>
        )}

        {exposant.statut === "VALIDE" && (
          <>
            <div className="mb-4 rounded-xl border border-neutral-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <PartenaireToggle
                  exposantId={exposant.id}
                  estPartenaire={exposant.estPartenaire}
                />
                <RemettreEnAttenteForm exposantId={exposant.id} />
              </div>
            </div>
            <div className="mb-8 rounded-xl border border-neutral-100 bg-neutral-50 p-5">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h2 className="font-heading font-semibold text-neutral-900">
                  Attribution de stand
                </h2>
                <span className="text-xs text-neutral-500">
                  {exposant.membresStand.length} membre{exposant.membresStand.length > 1 ? "s" : ""} équipe
                </span>
              </div>
              <AttribuerStandForm
                exposantId={exposant.id}
                defaultNumStand={exposant.numStand}
                defaultEmplacement={exposant.emplacement}
                defaultSuperficie={exposant.superficie}
              />
            </div>
          </>
        )}

        {/* Zone danger */}
        <div className="mb-8 flex justify-end">
          <SupprimerForm exposantId={exposant.id} raisonSociale={exposant.raisonSociale} />
        </div>

        {/* Édition libre du profil (admin) — aucun verrouillage par statut */}
        <div className="border-t border-neutral-100 pt-8">
          <p className="text-xs text-neutral-500 mb-4">
            En tant qu'administrateur, vous pouvez modifier tous les champs
            ci-dessous, quel que soit le statut de la fiche. Le statut lui-même
            se change via les actions plus haut (valider, refuser, remettre en
            attente).
          </p>
          <div className="mb-8">
            <LogoUpload
              initialLogoUrl={exposant.logoUrl}
              disabled={false}
              exposantId={exposant.id}
              uploadAction={televerserLogoAdmin}
              deleteAction={supprimerLogoAdmin}
            />
          </div>
          <ProfilForm exposant={exposant} saveAction={modifierProfilAdmin} adminMode />
        </div>
      </main>
    </>
  );
}
