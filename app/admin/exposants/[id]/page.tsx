import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import { ELEMENT_STAND_LABELS } from "@/lib/referentiel/elements-stand";
import { ANIMATION_LABELS } from "@/lib/referentiel/animations";
import type { SecteurCode } from "@/lib/referentiel/secteurs";
import type { ElementStandCode } from "@/lib/referentiel/elements-stand";
import type { AnimationCode } from "@/lib/referentiel/animations";
import { RefuserForm } from "./refuser-form";
import { ValiderForm } from "./valider-form";
import { AttribuerStandForm } from "./attribuer-stand-form";
import { PartenaireToggle } from "./partenaire-toggle";
import type { TypeOffre, TypeOpportunite } from "@prisma/client";

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Découverte métiers",
  OPPORTUNITES: "Opportunités",
};

const OPPORTUNITE_LABELS: Record<TypeOpportunite, string> = {
  STAGE_3E: "Stage 3e",
  STAGE_SECONDE: "Stage 2nde",
  STAGE_BTS: "Stage BTS",
  STAGE_LICENCE: "Stage Licence",
  STAGE_MASTER: "Stage Master",
  APPRENTISSAGE: "Apprentissage",
  ALTERNANCE: "Alternance",
  CDD: "CDD",
  CDI: "CDI",
  JOB_ETE: "Job d'été",
  DECOUVERTE: "Stage découverte",
};

const STATUT_RECRUTEMENT_LABELS: Record<string, string> = {
  OUI: "Oui, recrute",
  NON: "Pas de recrutement",
  PROCHAINEMENT: "Prochainement",
};

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
  if (!session?.user) return null;
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
              <PartenaireToggle
                exposantId={exposant.id}
                estPartenaire={exposant.estPartenaire}
              />
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

        {/* Contenu du profil */}
        <div className="space-y-8">
          <ProfilSection title="Identité">
            <Row label="SIRET" value={exposant.siret} />
            <Row label="Adresse" value={exposant.adresse} />
            <Row label="Site web" value={exposant.siteWeb} link />
            <Row label="Contact" value={
              [exposant.fonctionContact, exposant.telephoneContact]
                .filter(Boolean).join(" · ") || null
            } />
          </ProfilSection>

          <ProfilSection title="Secteurs">
            <Chips
              values={[
                ...exposant.secteurs.map(
                  (c) => SECTEUR_LABELS[c as SecteurCode] ?? c
                ),
                ...(exposant.secteurAutre ? [exposant.secteurAutre] : []),
              ]}
            />
          </ProfilSection>

          <ProfilSection title="Description">
            <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
              {exposant.description || <span className="italic text-neutral-500">Non renseignée</span>}
            </p>
          </ProfilSection>

          <ProfilSection title="Offres aux visiteurs">
            <Chips values={exposant.offres.map((o) => OFFRE_LABELS[o])} />
            {exposant.typesOpportunites.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-neutral-700 mb-1.5">Types d'opportunités :</p>
                <Chips values={exposant.typesOpportunites.map((o) => OPPORTUNITE_LABELS[o])} small />
              </div>
            )}
          </ProfilSection>

          <ProfilSection title="Stand">
            <Chips
              values={exposant.elementsStand.map(
                (c) => ELEMENT_STAND_LABELS[c as ElementStandCode] ?? c
              )}
            />
            {exposant.elementsStandAutre && (
              <p className="mt-2 text-sm text-neutral-700">+ {exposant.elementsStandAutre}</p>
            )}
          </ProfilSection>

          {exposant.animations.length > 0 && (
            <ProfilSection title="Animations">
              <Chips
                values={exposant.animations.map(
                  (c) => ANIMATION_LABELS[c as AnimationCode] ?? c
                )}
              />
            </ProfilSection>
          )}

          {exposant.innovationMiseEnAvant && (
            <ProfilSection title="Innovation mise en avant">
              <p className="text-sm text-neutral-900 leading-relaxed">
                {exposant.descriptionInnovation}
              </p>
            </ProfilSection>
          )}

          <ProfilSection title="Recrutement & consentement">
            <Row
              label="Recrutement"
              value={STATUT_RECRUTEMENT_LABELS[exposant.statutRecrutement] ?? exposant.statutRecrutement}
            />
            <Row
              label="Consentement communication"
              value={exposant.consentementCommunication ? "✓ Oui" : "✗ Non"}
            />
          </ProfilSection>

          <ProfilSection title="Capacité d'accueil">
            <Row label="Ressources matin" value={String(exposant.ressourcesMatin)} />
            <Row label="Ressources après-midi" value={String(exposant.ressourcesApresMidi)} />
            <Row label="Quota groupes / créneau" value={String(exposant.quotaGroupesMatinParCreneau)} />
            <Row label="Quota groupes / matinée" value={String(exposant.quotaGroupesMatinTotal)} />
          </ProfilSection>
        </div>
      </main>
    </>
  );
}

function ProfilSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-100 pt-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value, link }: { label: string; value: string | null | undefined; link?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-neutral-500 w-44 shrink-0">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2 break-all">
          {value}
        </a>
      ) : (
        <span className="text-neutral-900">{value}</span>
      )}
    </div>
  );
}

function Chips({ values, small }: { values: string[]; small?: boolean }) {
  if (!values.length) return <span className="text-sm italic text-neutral-500">Non renseigné</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className={`bg-neutral-100 text-neutral-700 rounded-full font-medium ${small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}
        >
          {v}
        </span>
      ))}
    </div>
  );
}
