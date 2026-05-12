"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getAdminSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") return null;
  return session;
}

export type AdminDEActionState = { ok: boolean; message?: string };

export async function supprimerDemandeurEmploi(
  _prev: AdminDEActionState,
  formData: FormData,
): Promise<AdminDEActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("deId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const de = await db.demandeurEmploi.findUnique({
    where: { id },
    select: { id: true, prenom: true, nom: true, userId: true },
  });
  if (!de) return { ok: false, message: "Inscrit introuvable." };

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "demandeur_emploi.supprime",
      entite: "DemandeurEmploi",
      entiteId: id,
      payload: { nom: `${de.prenom} ${de.nom}` },
    },
  });

  await db.user.delete({ where: { id: de.userId } });

  revalidatePath("/admin/demandeurs-emploi");
  redirect(`/admin/demandeurs-emploi?supprime=${encodeURIComponent(`${de.prenom} ${de.nom}`)}`);
}
