"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type StandActionState = {
  ok: boolean;
  message?: string;
};

async function getExposantVaide(userId: string) {
  const exposant = await db.exposant.findUnique({
    where: { userId },
    select: { id: true, statut: true },
  });
  if (!exposant || exposant.statut !== "VALIDE") return null;
  return exposant;
}

const infosSchema = z.object({
  nomStand: z.string().trim().max(100).optional().transform((v) => (v === "" ? null : v ?? null)),
  accrocheStand: z.string().trim().max(280).optional().transform((v) => (v === "" ? null : v ?? null)),
});

export async function mettreAJourInfosStand(
  _prev: StandActionState,
  formData: FormData,
): Promise<StandActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposant = await getExposantVaide(session.user.id);
  if (!exposant) return { ok: false, message: "Stand non accessible." };

  const parsed = infosSchema.safeParse({
    nomStand: formData.get("nomStand"),
    accrocheStand: formData.get("accrocheStand"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  await db.exposant.update({
    where: { id: exposant.id },
    data: parsed.data,
  });

  revalidatePath("/exposant/stand");
  return { ok: true, message: "Informations enregistrées." };
}

const membreSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis.").max(60),
  nom: z.string().trim().min(1, "Nom requis.").max(60),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")).transform((v) => (v ? v : null)),
  telephone: z.string().trim().max(30).optional().transform((v) => (v === "" ? null : v ?? null)),
  fonction: z.string().trim().max(80).optional().transform((v) => (v === "" ? null : v ?? null)),
});

export async function ajouterMembreStand(
  _prev: StandActionState,
  formData: FormData,
): Promise<StandActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposant = await getExposantVaide(session.user.id);
  if (!exposant) return { ok: false, message: "Stand non accessible." };

  const parsed = membreSchema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    fonction: formData.get("fonction"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  await db.membreStand.create({
    data: {
      exposantId: exposant.id,
      ...parsed.data,
    },
  });

  revalidatePath("/exposant/stand");
  return { ok: true, message: "Membre ajouté." };
}

export async function supprimerMembreStand(
  _prev: StandActionState,
  formData: FormData,
): Promise<StandActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposant = await getExposantVaide(session.user.id);
  if (!exposant) return { ok: false, message: "Stand non accessible." };

  const membreId = formData.get("membreId");
  if (typeof membreId !== "string") return { ok: false, message: "ID manquant." };

  const membre = await db.membreStand.findUnique({
    where: { id: membreId },
    select: { exposantId: true },
  });
  if (!membre || membre.exposantId !== exposant.id) {
    return { ok: false, message: "Membre introuvable." };
  }

  await db.membreStand.delete({ where: { id: membreId } });

  revalidatePath("/exposant/stand");
  return { ok: true };
}
