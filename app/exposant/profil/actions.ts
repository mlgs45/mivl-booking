"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  profilExposantDraftSchema,
  profilExposantSubmitSchema,
} from "@/lib/validation/exposant-profil";

export type ProfilState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

/**
 * Lit un FormData posté par le formulaire profil et le transforme en objet
 * compatible avec les schémas Zod (cases à cocher multiples → tableaux, booléens).
 */
function extractProfilFromFormData(formData: FormData) {
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  const all = (k: string) =>
    formData.getAll(k).filter((v): v is string => typeof v === "string");
  const bool = (k: string) => formData.get(k) === "on";

  return {
    raisonSociale: str("raisonSociale"),
    siret: str("siret") ?? "",
    adresse: str("adresse"),
    ville: str("ville"),
    codePostal: str("codePostal") ?? "",
    siteWeb: str("siteWeb") ?? "",
    telephoneContact: str("telephoneContact"),
    fonctionContact: str("fonctionContact"),

    secteurs: all("secteurs"),
    secteurAutre: str("secteurAutre"),
    description: str("description"),

    offres: all("offres"),
    typesOpportunites: all("typesOpportunites"),
    metiersProposes: all("metiersProposes"),

    elementsStand: all("elementsStand"),
    elementsStandAutre: str("elementsStandAutre"),

    animations: all("animations"),

    innovationMiseEnAvant: bool("innovationMiseEnAvant"),
    descriptionInnovation: str("descriptionInnovation"),

    statutRecrutement: str("statutRecrutement") ?? "NON",

    consentementCommunication: bool("consentementCommunication"),
  };
}

function issuesToErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}

async function getCurrentExposant() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true },
  });
  return exposant;
}

/** Sauvegarde brouillon — tolérante, pas de validation stricte. */
export async function sauvegarderProfil(
  _prev: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  const exposant = await getCurrentExposant();
  if (!exposant) {
    return { ok: false, message: "Session expirée, reconnectez-vous." };
  }
  if (exposant.statut === "VALIDE") {
    return {
      ok: false,
      message: "Profil déjà validé par la CCI, il n'est plus modifiable.",
    };
  }

  const raw = extractProfilFromFormData(formData);
  const parsed = profilExposantDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  }

  const d = parsed.data;
  await db.exposant.update({
    where: { id: exposant.id },
    data: {
      raisonSociale: d.raisonSociale ?? undefined,
      siret: d.siret && d.siret.length > 0 ? d.siret : null,
      adresse: d.adresse ?? null,
      ville: d.ville ?? undefined,
      codePostal: d.codePostal && d.codePostal.length > 0 ? d.codePostal : null,
      siteWeb: d.siteWeb && d.siteWeb.length > 0 ? d.siteWeb : null,
      telephoneContact: d.telephoneContact ?? null,
      fonctionContact: d.fonctionContact ?? null,
      secteurs: d.secteurs,
      secteurAutre: d.secteurAutre ?? null,
      description: d.description ?? "",
      offres: d.offres,
      typesOpportunites: d.offres.includes("OPPORTUNITES")
        ? d.typesOpportunites
        : [],
      metiersProposes: d.metiersProposes,
      elementsStand: d.elementsStand,
      elementsStandAutre: d.elementsStandAutre ?? null,
      animations: d.animations,
      innovationMiseEnAvant: d.innovationMiseEnAvant,
      descriptionInnovation: d.innovationMiseEnAvant
        ? (d.descriptionInnovation ?? null)
        : null,
      statutRecrutement: d.statutRecrutement,
      consentementCommunication: d.consentementCommunication,
      // Si le profil était refusé et qu'il repasse en édition, on le remet en BROUILLON
      statut: exposant.statut === "REFUSE" ? "BROUILLON" : exposant.statut,
    },
  });

  revalidatePath("/exposant");
  revalidatePath("/exposant/profil");
  return { ok: true, message: "Brouillon enregistré." };
}

/** Soumission à la CCI — validation stricte, transition BROUILLON/REFUSE → SOUMIS. */
export async function soumettreProfil(
  _prev: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  const exposant = await getCurrentExposant();
  if (!exposant) {
    return { ok: false, message: "Session expirée, reconnectez-vous." };
  }
  if (exposant.statut === "VALIDE" || exposant.statut === "SOUMIS") {
    return {
      ok: false,
      message: "Votre profil est déjà en cours de validation ou validé.",
    };
  }

  const raw = extractProfilFromFormData(formData);
  const parsed = profilExposantSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: issuesToErrors(parsed.error.issues),
      message: "Corrigez les erreurs avant de soumettre.",
    };
  }

  const d = parsed.data;
  await db.exposant.update({
    where: { id: exposant.id },
    data: {
      raisonSociale: d.raisonSociale,
      siret: d.siret && d.siret.length > 0 ? d.siret : null,
      adresse: d.adresse,
      ville: d.ville,
      codePostal: d.codePostal && d.codePostal.length > 0 ? d.codePostal : null,
      siteWeb: d.siteWeb && d.siteWeb.length > 0 ? d.siteWeb : null,
      telephoneContact: d.telephoneContact,
      fonctionContact: d.fonctionContact,
      secteurs: d.secteurs,
      secteurAutre: d.secteurAutre ?? null,
      description: d.description,
      offres: d.offres,
      typesOpportunites: d.offres.includes("OPPORTUNITES")
        ? d.typesOpportunites
        : [],
      metiersProposes: d.metiersProposes,
      elementsStand: d.elementsStand,
      elementsStandAutre: d.elementsStandAutre ?? null,
      animations: d.animations,
      innovationMiseEnAvant: d.innovationMiseEnAvant,
      descriptionInnovation: d.innovationMiseEnAvant
        ? (d.descriptionInnovation ?? null)
        : null,
      statutRecrutement: d.statutRecrutement,
      consentementCommunication: true,
      statut: "SOUMIS",
      motifRefus: null,
    },
  });

  revalidatePath("/exposant");
  revalidatePath("/exposant/profil");
  redirect("/exposant?soumis=1");
}
