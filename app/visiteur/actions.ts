"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { reserverSpeedDatings, type ReserverSpeedDatingsResult } from "@/lib/booking/speed-datings";

export type VisitorContext = {
  type: "JEUNE" | "DE";
  id: string;
  prenom: string;
  nom: string;
};

export async function getVisitorContext(): Promise<VisitorContext | null> {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === "JEUNE") {
    const j = await db.jeune.findUnique({
      where: { userId: session.user.id },
      select: { id: true, prenom: true, nom: true },
    });
    if (!j) return null;
    return { type: "JEUNE", id: j.id, prenom: j.prenom, nom: j.nom };
  }
  if (session.user.role === "DEMANDEUR_EMPLOI") {
    const d = await db.demandeurEmploi.findUnique({
      where: { userId: session.user.id },
      select: { id: true, prenom: true, nom: true },
    });
    if (!d) return null;
    return { type: "DE", id: d.id, prenom: d.prenom, nom: d.nom };
  }
  return null;
}

export type ConfirmerSpeedDatingsState = {
  ok: boolean;
  error?: string;
  result?: ReserverSpeedDatingsResult;
};

export async function confirmerSpeedDatings(
  exposantIds: string[],
): Promise<ConfirmerSpeedDatingsState> {
  const ctx = await getVisitorContext();
  if (!ctx) return { ok: false, error: "Non authentifié." };

  const result = await reserverSpeedDatings(
    { type: ctx.type, id: ctx.id },
    exposantIds,
  );

  revalidatePath("/visiteur");
  return { ok: true, result };
}

export async function annulerRdvVisiteur(rdvId: string): Promise<void> {
  const ctx = await getVisitorContext();
  if (!ctx) return;

  const rdv = await db.rendezVous.findUnique({
    where: { id: rdvId },
    select: {
      statut: true,
      jeuneId: true,
      demandeurEmploiId: true,
      creneau: { select: { debut: true } },
    },
  });
  if (!rdv) return;

  const isOwner =
    (ctx.type === "JEUNE" && rdv.jeuneId === ctx.id) ||
    (ctx.type === "DE" && rdv.demandeurEmploiId === ctx.id);
  if (!isOwner) return;
  if (rdv.statut === "ANNULE") return;
  if (rdv.creneau.debut < new Date()) return;

  await db.rendezVous.update({
    where: { id: rdvId },
    data: { statut: "ANNULE", annuleA: new Date() },
  });

  revalidatePath("/visiteur");
}
