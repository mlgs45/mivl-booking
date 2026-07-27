"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  profilExposantDraftSchema,
  profilExposantSubmitSchema,
} from "@/lib/validation/exposant-profil";
import {
  extractProfilFromFormData,
  issuesToErrors,
} from "@/lib/exposant-profil-form";

export type ProfilState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

async function getCurrentExposant() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true },
  });
  return exposant;
}

/**
 * Sauvegarde brouillon — tolérante, pas de validation stricte.
 *
 * Statuts :
 * - SOUMIS / LISTE_ATTENTE : tout verrouillé (dossier entre les mains de la
 *   CCI, qui peut le repêcher tel quel à tout moment)
 * - VALIDE : seuls les champs "cosmétiques" (logo, description, contact, site
 *   web, innovation description, statut recrutement) sont mis à jour — les
 *   champs structurels restent intouchables sans re-validation CCI
 * - BROUILLON / REFUSE : édition complète
 */
export async function sauvegarderProfil(
  _prev: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  const exposant = await getCurrentExposant();
  if (!exposant) {
    return { ok: false, message: "Session expirée, reconnectez-vous." };
  }
  if (exposant.statut === "SOUMIS" || exposant.statut === "LISTE_ATTENTE") {
    return {
      ok: false,
      message:
        exposant.statut === "LISTE_ATTENTE"
          ? "Votre candidature est en liste d'attente : contactez la CCI pour faire évoluer votre fiche."
          : "Fiche en cours de validation par la CCI, modification impossible pour le moment.",
    };
  }

  const raw = extractProfilFromFormData(formData);
  const parsed = profilExposantDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  }

  const d = parsed.data;

  if (exposant.statut === "VALIDE") {
    // Mise à jour "cosmétique" uniquement — les champs validés par la CCI
    // ne sont pas touchés.
    await db.exposant.update({
      where: { id: exposant.id },
      data: {
        description: d.description ?? undefined,
        siteWeb: d.siteWeb && d.siteWeb.length > 0 ? d.siteWeb : null,
        nomContact: d.nomContact ?? null,
        telephoneContact: d.telephoneContact ?? null,
        fonctionContact: d.fonctionContact ?? null,
        descriptionInnovation: d.descriptionInnovation ?? null,
        statutRecrutement: d.statutRecrutement,
      },
    });
    revalidatePath("/exposant");
    revalidatePath("/exposant/profil");
    revalidatePath(`/exposants/${exposant.id}`);
    // La fiche est publique : l'annuaire (ISR) doit repartir sur des données fraîches.
    revalidatePath("/exposants");
    return { ok: true, message: "Modifications enregistrées." };
  }

  await db.exposant.update({
    where: { id: exposant.id },
    data: {
      raisonSociale: d.raisonSociale ?? undefined,
      siret: d.siret && d.siret.length > 0 ? d.siret : null,
      adresse: d.adresse ?? null,
      ville: d.ville ?? undefined,
      codePostal: d.codePostal && d.codePostal.length > 0 ? d.codePostal : null,
      siteWeb: d.siteWeb && d.siteWeb.length > 0 ? d.siteWeb : null,
      nomContact: d.nomContact ?? null,
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
  // Liste blanche : seuls BROUILLON et REFUSE (re)soumettent. LISTE_ATTENTE en
  // est exclu — une resoumission ferait sauter la file d'attente.
  if (exposant.statut !== "BROUILLON" && exposant.statut !== "REFUSE") {
    return {
      ok: false,
      message:
        exposant.statut === "LISTE_ATTENTE"
          ? "Votre candidature est en liste d'attente : la CCI reviendra vers vous dès qu'un stand se libère."
          : "Votre profil est déjà en cours de validation ou validé.",
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
      nomContact: d.nomContact,
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
