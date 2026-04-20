"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { groupeSchema } from "@/lib/validation/enseignant";
import { reserverParcours, annulerParcoursGroupe } from "@/lib/booking/parcours";

export type GroupeFormState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

async function getEnseignantId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ENSEIGNANT") return null;
  const ens = await db.enseignant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return ens?.id ?? null;
}

function parsePrenoms(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function creerGroupe(
  _prev: GroupeFormState,
  formData: FormData,
): Promise<GroupeFormState> {
  const enseignantId = await getEnseignantId();
  if (!enseignantId) return { ok: false, message: "Non authentifié." };

  const parsed = groupeSchema.safeParse({
    nom: formData.get("nom"),
    niveau: formData.get("niveau"),
    tailleEffective: formData.get("tailleEffective"),
    prenomsEleves: parsePrenoms(formData.get("prenomsEleves")),
    creneauArrivee: formData.get("creneauArrivee"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, errors: fieldErrors };
  }

  const g = await db.groupe.create({
    data: {
      enseignantId,
      nom: parsed.data.nom,
      niveau: parsed.data.niveau,
      tailleEffective: parsed.data.tailleEffective,
      prenomsEleves: parsed.data.prenomsEleves,
      creneauArrivee: parsed.data.creneauArrivee,
    },
    select: { id: true },
  });

  revalidatePath("/enseignant");
  redirect(`/enseignant/groupes/${g.id}`);
}

export async function modifierGroupe(
  groupeId: string,
  _prev: GroupeFormState,
  formData: FormData,
): Promise<GroupeFormState> {
  const enseignantId = await getEnseignantId();
  if (!enseignantId) return { ok: false, message: "Non authentifié." };

  const groupe = await db.groupe.findUnique({
    where: { id: groupeId },
    select: { enseignantId: true, rendezVous: { where: { statut: { not: "ANNULE" } }, select: { id: true } } },
  });
  if (!groupe || groupe.enseignantId !== enseignantId) {
    return { ok: false, message: "Groupe introuvable." };
  }
  if (groupe.rendezVous.length > 0) {
    return { ok: false, message: "Impossible de modifier un groupe avec un parcours actif. Annulez-le d'abord." };
  }

  const parsed = groupeSchema.safeParse({
    nom: formData.get("nom"),
    niveau: formData.get("niveau"),
    tailleEffective: formData.get("tailleEffective"),
    prenomsEleves: parsePrenoms(formData.get("prenomsEleves")),
    creneauArrivee: formData.get("creneauArrivee"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, errors: fieldErrors };
  }

  await db.groupe.update({
    where: { id: groupeId },
    data: {
      nom: parsed.data.nom,
      niveau: parsed.data.niveau,
      tailleEffective: parsed.data.tailleEffective,
      prenomsEleves: parsed.data.prenomsEleves,
      creneauArrivee: parsed.data.creneauArrivee,
    },
  });

  revalidatePath(`/enseignant/groupes/${groupeId}`);
  return { ok: true, message: "Groupe mis à jour." };
}

export async function supprimerGroupe(groupeId: string): Promise<void> {
  const enseignantId = await getEnseignantId();
  if (!enseignantId) return;

  const groupe = await db.groupe.findUnique({
    where: { id: groupeId },
    select: { enseignantId: true, rendezVous: { where: { statut: { not: "ANNULE" } }, select: { id: true } } },
  });
  if (!groupe || groupe.enseignantId !== enseignantId) return;
  if (groupe.rendezVous.length > 0) return;

  await db.groupe.delete({ where: { id: groupeId } });
  revalidatePath("/enseignant");
  redirect("/enseignant");
}

export type ReserverParcoursState = {
  ok: boolean;
  error?: string;
};

export async function confirmerParcours(
  groupeId: string,
  exposantIds: string[],
): Promise<ReserverParcoursState> {
  const enseignantId = await getEnseignantId();
  if (!enseignantId) return { ok: false, error: "Non authentifié." };

  const groupe = await db.groupe.findUnique({
    where: { id: groupeId },
    select: { enseignantId: true },
  });
  if (!groupe || groupe.enseignantId !== enseignantId) {
    return { ok: false, error: "Groupe introuvable." };
  }

  const result = await reserverParcours(groupeId, exposantIds);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/enseignant/groupes/${groupeId}`);
  return { ok: true };
}

export async function annulerParcours(groupeId: string): Promise<void> {
  const enseignantId = await getEnseignantId();
  if (!enseignantId) return;

  const groupe = await db.groupe.findUnique({
    where: { id: groupeId },
    select: { enseignantId: true },
  });
  if (!groupe || groupe.enseignantId !== enseignantId) return;

  await annulerParcoursGroupe(groupeId);
  revalidatePath(`/enseignant/groupes/${groupeId}`);
}
