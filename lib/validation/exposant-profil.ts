import { z } from "zod";
import { isSecteurCode } from "@/lib/referentiel/secteurs";
import { isElementStandCode } from "@/lib/referentiel/elements-stand";
import { isAnimationCode } from "@/lib/referentiel/animations";
import { METIER_CODES } from "@/lib/referentiel/metiers";
import type { TypeOffre, TypeOpportunite, StatutRecrutement } from "@prisma/client";

const OFFRE_VALUES: TypeOffre[] = [
  "DECOUVERTE_ENTREPRISE",
  "DECOUVERTE_METIERS",
  "OPPORTUNITES",
];

const OPPORTUNITE_VALUES: TypeOpportunite[] = [
  "STAGE_3E",
  "STAGE_SECONDE",
  "STAGE_BTS",
  "STAGE_LICENCE",
  "STAGE_MASTER",
  "APPRENTISSAGE",
  "ALTERNANCE",
  "CDD",
  "CDI",
  "JOB_ETE",
  "DECOUVERTE",
];

const STATUT_RECRUTEMENT_VALUES: StatutRecrutement[] = [
  "OUI",
  "NON",
  "PROCHAINEMENT",
];

const METIER_SET = new Set<string>(METIER_CODES);

/**
 * Schéma pour sauvegarde brouillon : tout est optionnel, les valeurs vides sont tolérées.
 * Sert pour auto-save et bouton "Enregistrer".
 */
export const profilExposantDraftSchema = z.object({
  raisonSociale: z.string().trim().max(200).optional(),
  siret: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "SIRET : 14 chiffres")
    .optional()
    .or(z.literal("")),
  adresse: z.string().trim().max(500).optional(),
  ville: z.string().trim().max(100).optional(),
  codePostal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide")
    .optional()
    .or(z.literal("")),
  siteWeb: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  nomContact: z.string().trim().max(120).optional(),
  telephoneContact: z.string().trim().max(30).optional(),
  fonctionContact: z.string().trim().max(100).optional(),

  secteurs: z.array(z.string().refine(isSecteurCode, "Secteur inconnu")).default([]),
  secteurAutre: z.string().trim().max(200).optional(),

  description: z.string().trim().max(2000).optional(),

  offres: z
    .array(z.enum(OFFRE_VALUES as [TypeOffre, ...TypeOffre[]]))
    .default([]),
  typesOpportunites: z
    .array(z.enum(OPPORTUNITE_VALUES as [TypeOpportunite, ...TypeOpportunite[]]))
    .default([]),
  metiersProposes: z
    .array(z.string().refine((v) => METIER_SET.has(v), "Métier inconnu"))
    .default([]),

  elementsStand: z
    .array(z.string().refine(isElementStandCode, "Élément stand inconnu"))
    .default([]),
  elementsStandAutre: z.string().trim().max(200).optional(),

  animations: z
    .array(z.string().refine(isAnimationCode, "Animation inconnue"))
    .default([]),

  innovationMiseEnAvant: z.boolean().default(false),
  descriptionInnovation: z.string().trim().max(1000).optional(),

  statutRecrutement: z
    .enum(STATUT_RECRUTEMENT_VALUES as [StatutRecrutement, ...StatutRecrutement[]])
    .default("NON"),

  consentementCommunication: z.boolean().default(false),
});

export type ProfilExposantDraftInput = z.infer<typeof profilExposantDraftSchema>;

/**
 * Schéma strict pour la soumission CCI : tous les champs obligatoires doivent être remplis.
 */
export const profilExposantSubmitSchema = profilExposantDraftSchema
  .extend({
    raisonSociale: z.string().trim().min(2, "Raison sociale requise").max(200),
    adresse: z.string().trim().min(5, "Adresse requise").max(500),
    ville: z.string().trim().min(1, "Ville requise").max(100),
    nomContact: z
      .string()
      .trim()
      .min(2, "Prénom et nom du référent requis")
      .max(120),
    telephoneContact: z
      .string()
      .trim()
      .min(6, "Téléphone du contact requis")
      .max(30),
    fonctionContact: z
      .string()
      .trim()
      .min(2, "Fonction du contact requise")
      .max(100),
    secteurs: z
      .array(z.string().refine(isSecteurCode, "Secteur inconnu"))
      .min(1, "Sélectionnez au moins un secteur"),
    description: z
      .string()
      .trim()
      .min(50, "Décrivez votre entreprise (50 caractères min)")
      .max(2000),
    offres: z
      .array(z.enum(OFFRE_VALUES as [TypeOffre, ...TypeOffre[]]))
      .min(1, "Choisissez au moins un type d'offre"),
    elementsStand: z
      .array(z.string().refine(isElementStandCode, "Élément stand inconnu"))
      .min(1, "Sélectionnez au moins un élément présenté sur le stand"),
    consentementCommunication: z.literal(true, {
      message: "Le consentement communication est requis pour soumettre",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.offres.includes("OPPORTUNITES") && data.typesOpportunites.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["typesOpportunites"],
        message: "Précisez au moins un type d'opportunité",
      });
    }
    if (
      data.innovationMiseEnAvant &&
      (!data.descriptionInnovation || data.descriptionInnovation.length < 20)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["descriptionInnovation"],
        message: "Décrivez votre innovation (20 caractères min)",
      });
    }
  });

export type ProfilExposantSubmitInput = z.infer<typeof profilExposantSubmitSchema>;
