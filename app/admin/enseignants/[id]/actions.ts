"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getAdminSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") return null;
  return session;
}

export type AdminEnseignantActionState = {
  ok: boolean;
  message?: string;
};

export async function validerEnseignant(
  _prev: AdminEnseignantActionState,
  formData: FormData,
): Promise<AdminEnseignantActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("enseignantId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const enseignant = await db.enseignant.findUnique({
    where: { id },
    select: { id: true, statut: true, prenom: true, nom: true, user: { select: { email: true } } },
  });
  if (!enseignant) return { ok: false, message: "Enseignant introuvable." };
  if (enseignant.statut !== "SOUMIS") {
    return { ok: false, message: "Seuls les profils en statut SOUMIS peuvent être validés." };
  }

  await db.enseignant.update({
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
      action: "enseignant.valide",
      entite: "Enseignant",
      entiteId: id,
    },
  });

  await sendEmail({
    to: enseignant.user.email,
    template: "enseignant-valide",
    data: { prenom: enseignant.prenom, appUrl: APP_URL },
  });

  revalidatePath("/admin/enseignants");
  revalidatePath(`/admin/enseignants/${id}`);
  redirect(`/admin/enseignants?valide=${encodeURIComponent(`${enseignant.prenom} ${enseignant.nom}`)}`);
}

export async function refuserEnseignant(
  _prev: AdminEnseignantActionState,
  formData: FormData,
): Promise<AdminEnseignantActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const parsed = z.object({
    enseignantId: z.string().min(1),
    motifRefus: z.string().trim().min(10, "Motif trop court (10 caractères min).").max(1000),
  }).safeParse({
    enseignantId: formData.get("enseignantId"),
    motifRefus: formData.get("motifRefus"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { enseignantId, motifRefus } = parsed.data;

  const enseignant = await db.enseignant.findUnique({
    where: { id: enseignantId },
    select: { id: true, statut: true, prenom: true, nom: true, user: { select: { email: true } } },
  });
  if (!enseignant) return { ok: false, message: "Enseignant introuvable." };
  if (enseignant.statut !== "SOUMIS") {
    return { ok: false, message: "Seuls les profils en statut SOUMIS peuvent être refusés." };
  }

  await db.enseignant.update({
    where: { id: enseignantId },
    data: { statut: "REFUSE", motifRefus },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "enseignant.refuse",
      entite: "Enseignant",
      entiteId: enseignantId,
      payload: { motifRefus },
    },
  });

  await sendEmail({
    to: enseignant.user.email,
    template: "enseignant-refuse",
    data: { prenom: enseignant.prenom, motif: motifRefus },
  });

  revalidatePath("/admin/enseignants");
  revalidatePath(`/admin/enseignants/${enseignantId}`);
  redirect(`/admin/enseignants?refuse=${encodeURIComponent(`${enseignant.prenom} ${enseignant.nom}`)}`);
}
