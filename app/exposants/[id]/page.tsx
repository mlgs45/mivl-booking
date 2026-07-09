import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { SECTEUR_LABELS } from "@/lib/referentiel/secteurs";
import { ELEMENT_STAND_LABELS } from "@/lib/referentiel/elements-stand";
import { ANIMATION_LABELS } from "@/lib/referentiel/animations";
import { METIER_LABELS } from "@/lib/referentiel/metiers";
import { departementFromCodePostal } from "@/lib/referentiel/departements";
import type { SecteurCode } from "@/lib/referentiel/secteurs";
import type { ElementStandCode } from "@/lib/referentiel/elements-stand";
import type { AnimationCode } from "@/lib/referentiel/animations";
import type { TypeOffre, TypeOpportunite } from "@prisma/client";

const OFFRE_LABELS: Record<TypeOffre, string> = {
  DECOUVERTE_ENTREPRISE: "Découverte entreprise",
  DECOUVERTE_METIERS: "Découverte métiers",
  OPPORTUNITES: "Opportunités concrètes",
};

const OPPORTUNITE_LABELS: Record<TypeOpportunite, string> = {
  STAGE_3E: "Stage de 3e",
  STAGE_SECONDE: "Stage de 2nde",
  STAGE_BTS: "Stage BTS",
  STAGE_LICENCE: "Stage Licence",
  STAGE_MASTER: "Stage Master / École d'ingé",
  APPRENTISSAGE: "Apprentissage",
  ALTERNANCE: "Alternance",
  CDD: "CDD",
  CDI: "CDI",
  JOB_ETE: "Job d'été",
  DECOUVERTE: "Stage découverte libre",
};

const STATUT_RECRUTEMENT_LABELS: Record<string, string> = {
  OUI: "Recrute actuellement",
  NON: "Pas de recrutement en cours",
  PROCHAINEMENT: "Recrutement à venir prochainement",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await db.exposant.findUnique({
    where: { id },
    select: { raisonSociale: true, statut: true, description: true },
  });
  if (!e || e.statut !== "VALIDE") return { title: "Exposant — MIVL Connect" };
  return {
    title: `${e.raisonSociale} — Exposants MIVL Connect`,
    description: e.description.slice(0, 160),
  };
}

export default async function ExposantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exposant = await db.exposant.findUnique({
    where: { id },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      codePostal: true,
      description: true,
      siteWeb: true,
      logoUrl: true,
      secteurs: true,
      secteurAutre: true,
      offres: true,
      typesOpportunites: true,
      metiersProposes: true,
      elementsStand: true,
      elementsStandAutre: true,
      animations: true,
      innovationMiseEnAvant: true,
      descriptionInnovation: true,
      statutRecrutement: true,
      numStand: true,
      emplacement: true,
      estPartenaire: true,
      statut: true,
    },
  });

  // Fiche non trouvée ou pas encore validée par la CCI : pas de fiche publique.
  if (!exposant || exposant.statut !== "VALIDE") notFound();

  const dept = departementFromCodePostal(exposant.codePostal);
  const secteurLabels = [
    ...exposant.secteurs.map((c) => SECTEUR_LABELS[c as SecteurCode] ?? c),
    ...(exposant.secteurAutre ? [exposant.secteurAutre] : []),
  ];
  const metierLabels = exposant.metiersProposes.map((c) => METIER_LABELS[c] ?? c);
  const elementLabels = exposant.elementsStand.map(
    (c) => ELEMENT_STAND_LABELS[c as ElementStandCode] ?? c,
  );
  const animationLabels = exposant.animations.map(
    (c) => ANIMATION_LABELS[c as AnimationCode] ?? c,
  );

  return (
    <>
      <PublicHeader />
      <main className="bg-neutral-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/exposants"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2 mb-6"
          >
            ← Tous les exposants
          </Link>

          {/* En-tête entreprise */}
          <div
            className={`bg-white rounded-2xl border p-6 sm:p-8 mb-6 ${
              exposant.estPartenaire ? "border-accent/60 ring-1 ring-accent/30" : "border-neutral-100"
            }`}
          >
            {exposant.estPartenaire && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-900 bg-accent/30 px-2.5 py-1 rounded-full mb-4">
                ★ Partenaire
              </span>
            )}
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden">
                {exposant.logoUrl ? (
                  <Image
                    src={exposant.logoUrl}
                    alt={`Logo ${exposant.raisonSociale}`}
                    width={96}
                    height={96}
                    className="object-contain w-full h-full p-1.5"
                  />
                ) : (
                  <span className="text-2xl font-heading font-bold text-neutral-500">
                    {exposant.raisonSociale.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 leading-snug mb-1">
                  {exposant.raisonSociale}
                </h1>
                <p className="text-sm text-neutral-700 mb-3">
                  {exposant.ville}
                  {dept ? ` · ${dept}` : ""}
                  {exposant.numStand ? ` · Stand ${exposant.numStand}` : ""}
                  {exposant.emplacement ? ` (${exposant.emplacement})` : ""}
                </p>
                {secteurLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {secteurLabels.map((label) => (
                      <span
                        key={label}
                        className="text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {exposant.siteWeb && (
                  <a
                    href={exposant.siteWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2"
                  >
                    Visiter le site web →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <Section title="Présentation">
            <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
              {exposant.description}
            </p>
          </Section>

          {/* Ce que propose l'entreprise */}
          {exposant.offres.length > 0 && (
            <Section title="Ce que propose l'entreprise aux visiteurs">
              <Chips values={exposant.offres.map((o) => OFFRE_LABELS[o])} />
              {exposant.typesOpportunites.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-700 mb-1.5">Types d'opportunités :</p>
                  <Chips
                    values={exposant.typesOpportunites.map((o) => OPPORTUNITE_LABELS[o])}
                    small
                  />
                </div>
              )}
              <p className="mt-3 text-sm text-neutral-700">
                {STATUT_RECRUTEMENT_LABELS[exposant.statutRecrutement] ?? exposant.statutRecrutement}
              </p>
            </Section>
          )}

          {/* Métiers */}
          {metierLabels.length > 0 && (
            <Section title="Métiers représentés sur le stand">
              <Chips values={metierLabels} small />
            </Section>
          )}

          {/* Stand */}
          {elementLabels.length > 0 && (
            <Section title="À voir sur le stand">
              <Chips values={elementLabels} />
              {exposant.elementsStandAutre && (
                <p className="mt-2 text-sm text-neutral-700">+ {exposant.elementsStandAutre}</p>
              )}
            </Section>
          )}

          {/* Animations */}
          {animationLabels.length > 0 && (
            <Section title="Animations et interventions">
              <Chips values={animationLabels} />
            </Section>
          )}

          {/* Innovation */}
          {exposant.innovationMiseEnAvant && exposant.descriptionInnovation && (
            <Section title="Innovation mise en avant">
              <p className="text-sm text-neutral-900 leading-relaxed">
                {exposant.descriptionInnovation}
              </p>
            </Section>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8 mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chips({ values, small }: { values: string[]; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className={`bg-neutral-100 text-neutral-700 rounded-full font-medium ${
            small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
          }`}
        >
          {v}
        </span>
      ))}
    </div>
  );
}
