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

export type AdminJeuneActionState = { ok: boolean; message?: string };

export async function supprimerJeune(
  _prev: AdminJeuneActionState,
  formData: FormData,
): Promise<AdminJeuneActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const id = formData.get("jeuneId");
  if (typeof id !== "string") return { ok: false, message: "ID manquant." };

  const jeune = await db.jeune.findUnique({
    where: { id },
    select: { id: true, prenom: true, nom: true, userId: true },
  });
  if (!jeune) return { ok: false, message: "Inscrit introuvable." };

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "jeune.supprime",
      entite: "Jeune",
      entiteId: id,
      payload: { nom: `${jeune.prenom} ${jeune.nom}` },
    },
  });

  await db.user.delete({ where: { id: jeune.userId } });

  revalidatePath("/admin/jeunes");
  redirect(`/admin/jeunes?supprime=${encodeURIComponent(`${jeune.prenom} ${jeune.nom}`)}`);
}
