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

export type AdminVisiteurActionState = { ok: boolean; message?: string };

export async function supprimerVisiteur(
  _prev: AdminVisiteurActionState,
  formData: FormData,
): Promise<AdminVisiteurActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("visiteurId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const visiteur = await db.visiteur.findUnique({
    where: { id },
    select: { id: true, prenom: true, nom: true },
  });
  if (!visiteur) return { ok: false, message: "Visiteur introuvable." };

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "visiteur.supprime",
      entite: "Visiteur",
      entiteId: id,
      payload: { nom: `${visiteur.prenom} ${visiteur.nom}` },
    },
  });

  await db.visiteur.delete({ where: { id } });

  revalidatePath("/admin/visiteurs");
  redirect(`/admin/visiteurs?supprime=${encodeURIComponent(`${visiteur.prenom} ${visiteur.nom}`)}`);
}
