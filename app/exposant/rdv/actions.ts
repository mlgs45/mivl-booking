"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type RdvActionState = { ok: boolean; message?: string };

export async function annulerRdv(
  _prev: RdvActionState,
  formData: FormData,
): Promise<RdvActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true },
  });
  if (!exposant || exposant.statut !== "VALIDE") {
    return { ok: false, message: "Accès non autorisé." };
  }

  const rdvId = formData.get("rdvId");
  if (typeof rdvId !== "string") return { ok: false, message: "ID manquant." };

  const rdv = await db.rendezVous.findUnique({
    where: { id: rdvId },
    include: { creneau: { select: { exposantId: true, debut: true } } },
  });

  if (!rdv || rdv.creneau.exposantId !== exposant.id) {
    return { ok: false, message: "Rendez-vous introuvable." };
  }
  if (rdv.statut === "ANNULE") {
    return { ok: false, message: "Déjà annulé." };
  }
  if (rdv.creneau.debut < new Date()) {
    return { ok: false, message: "Impossible d'annuler un RDV passé." };
  }

  await db.rendezVous.update({
    where: { id: rdvId },
    data: { statut: "ANNULE", annuleA: new Date() },
  });

  revalidatePath("/exposant/rdv");
  return { ok: true };
}
