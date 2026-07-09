"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";
import { profilExposantDraftSchema } from "@/lib/validation/exposant-profil";
import {
  extractProfilFromFormData,
  issuesToErrors,
} from "@/lib/exposant-profil-form";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getAdminSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") return null;
  return session;
}

export type AdminActionState = {
  ok: boolean;
  message?: string;
};

export type ProfilState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

/**
 * Édition libre du profil par un admin — ignore le verrouillage par statut
 * qui s'applique à l'exposant lui-même (cf. app/exposant/profil/actions.ts).
 * Ne touche jamais au statut : celui-ci reste géré par valider/refuser/
 * remettreEnAttente ci-dessous.
 */
export async function modifierProfilAdmin(
  _prev: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposantId = formData.get("exposantId");
  if (typeof exposantId !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id: exposantId },
    select: { id: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };

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
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.profil.modifie_admin",
      entite: "Exposant",
      entiteId: exposant.id,
    },
  });

  revalidatePath(`/admin/exposants/${exposant.id}`);
  revalidatePath("/exposant");
  revalidatePath("/exposant/profil");
  revalidatePath(`/exposants/${exposant.id}`);
  return { ok: true, message: "Modifications enregistrées." };
}

export async function validerExposant(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("exposantId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id },
    select: { id: true, statut: true, raisonSociale: true, user: { select: { email: true } } },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };
  if (exposant.statut !== "SOUMIS") {
    return { ok: false, message: "Seuls les profils en statut SOUMIS peuvent être validés." };
  }

  await db.exposant.update({
    where: { id },
    data: {
      statut: "VALIDE",
      valideParId: session.user.id,
      valideA: new Date(),
      motifRefus: null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.valide",
      entite: "Exposant",
      entiteId: id,
    },
  });

  await sendEmail({
    to: exposant.user.email,
    template: "exposant-valide",
    data: { raisonSociale: exposant.raisonSociale, appUrl: APP_URL },
  });

  revalidatePath("/admin/exposants");
  revalidatePath(`/admin/exposants/${id}`);
  redirect(`/admin/exposants?valide=${encodeURIComponent(exposant.raisonSociale)}`);
}

export async function refuserExposant(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const parsed = z.object({
    exposantId: z.string().min(1),
    motifRefus: z.string().trim().min(10, "Motif trop court (10 caractères min).").max(1000),
  }).safeParse({
    exposantId: formData.get("exposantId"),
    motifRefus: formData.get("motifRefus"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { exposantId, motifRefus } = parsed.data;

  const exposant = await db.exposant.findUnique({
    where: { id: exposantId },
    select: { id: true, statut: true, raisonSociale: true, user: { select: { email: true } } },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };
  if (exposant.statut !== "SOUMIS") {
    return { ok: false, message: "Seuls les profils en statut SOUMIS peuvent être refusés." };
  }

  await db.exposant.update({
    where: { id: exposantId },
    data: { statut: "REFUSE", motifRefus },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.refuse",
      entite: "Exposant",
      entiteId: exposantId,
      payload: { motifRefus },
    },
  });

  await sendEmail({
    to: exposant.user.email,
    template: "exposant-refuse",
    data: { raisonSociale: exposant.raisonSociale, motif: motifRefus },
  });

  revalidatePath("/admin/exposants");
  revalidatePath(`/admin/exposants/${exposantId}`);
  redirect(`/admin/exposants?refuse=${encodeURIComponent(exposant.raisonSociale)}`);
}

const standSchema = z.object({
  exposantId: z.string().min(1),
  numStand: z.string().trim().max(20).optional().transform((v) => (v === "" ? null : v ?? null)),
  emplacement: z.string().trim().max(200).optional().transform((v) => (v === "" ? null : v ?? null)),
  superficie: z.coerce.number().int().min(1).max(500).optional().nullable(),
});

export async function attribuerStand(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const rawSuperficie = formData.get("superficie");
  const parsed = standSchema.safeParse({
    exposantId: formData.get("exposantId"),
    numStand: formData.get("numStand"),
    emplacement: formData.get("emplacement"),
    superficie: rawSuperficie === "" || rawSuperficie == null ? null : rawSuperficie,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { exposantId, numStand, emplacement, superficie } = parsed.data;

  const exposant = await db.exposant.findUnique({
    where: { id: exposantId },
    select: { id: true, statut: true, numStand: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };
  if (exposant.statut !== "VALIDE") {
    return { ok: false, message: "L'exposant doit être validé avant attribution du stand." };
  }

  if (numStand && numStand !== exposant.numStand) {
    const existing = await db.exposant.findUnique({
      where: { numStand },
      select: { id: true },
    });
    if (existing && existing.id !== exposantId) {
      return { ok: false, message: `Le numéro de stand "${numStand}" est déjà attribué.` };
    }
  }

  await db.exposant.update({
    where: { id: exposantId },
    data: {
      numStand,
      emplacement,
      superficie: superficie ?? null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.stand.attribue",
      entite: "Exposant",
      entiteId: exposantId,
      payload: { numStand, emplacement, superficie },
    },
  });

  revalidatePath(`/admin/exposants/${exposantId}`);
  return { ok: true, message: "Stand mis à jour." };
}

export async function supprimerExposant(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("exposantId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id },
    select: { id: true, raisonSociale: true, userId: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.supprime",
      entite: "Exposant",
      entiteId: id,
      payload: { raisonSociale: exposant.raisonSociale },
    },
  });

  // La suppression du User cascade sur Exposant (onDelete: Cascade)
  await db.user.delete({ where: { id: exposant.userId } });

  revalidatePath("/admin/exposants");
  redirect(`/admin/exposants?supprime=${encodeURIComponent(exposant.raisonSociale)}`);
}

export async function remettreEnAttente(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("exposantId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id },
    select: { id: true, statut: true, raisonSociale: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };
  if (exposant.statut !== "VALIDE") {
    return { ok: false, message: "Seuls les exposants validés peuvent être remis en attente." };
  }

  await db.exposant.update({
    where: { id },
    data: {
      statut: "SOUMIS",
      valideParId: null,
      valideA: null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.remis_en_attente",
      entite: "Exposant",
      entiteId: id,
    },
  });

  revalidatePath("/admin/exposants");
  revalidatePath(`/admin/exposants/${id}`);
  return { ok: true, message: "Exposant remis en attente de validation." };
}

export async function togglePartenaire(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("exposantId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id },
    select: { estPartenaire: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };

  const next = !exposant.estPartenaire;
  await db.exposant.update({
    where: { id },
    data: { estPartenaire: next },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: next ? "exposant.partenaire.on" : "exposant.partenaire.off",
      entite: "Exposant",
      entiteId: id,
    },
  });

  revalidatePath("/admin/exposants");
  revalidatePath(`/admin/exposants/${id}`);
  revalidatePath("/exposants");
  return { ok: true, message: next ? "Marqué comme partenaire." : "Marqueur partenaire retiré." };
}
