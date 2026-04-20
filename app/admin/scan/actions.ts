"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { identifierToken } from "@/lib/scan/identifier";

export type EntreeResult =
  | {
      ok: true;
      kind: "GROUPE" | "JEUNE" | "DE" | "MEMBRE_STAND";
      label: string;
      sousTitre: string;
      deja: boolean; // déjà scanné avant ce scan
      horodatage: string; // ISO string de l'entrée
    }
  | { ok: false; message: string };

export async function scannerEntreeSalon(
  tokenRaw: string,
): Promise<EntreeResult> {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") {
    return { ok: false, message: "Non autorisé." };
  }

  const target = await identifierToken(tokenRaw);
  if (!target) {
    return { ok: false, message: "QR code inconnu." };
  }

  const now = new Date();

  if (target.kind === "MEMBRE_STAND") {
    await db.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "entree.membre_stand",
        entite: "MembreStand",
        entiteId: target.id,
      },
    });
    revalidatePath("/admin/live");
    return {
      ok: true,
      kind: "MEMBRE_STAND",
      label: target.label,
      sousTitre: target.sousTitre,
      deja: false,
      horodatage: now.toISOString(),
    };
  }

  const deja = target.arriveAuSalonA != null;

  if (!deja) {
    if (target.kind === "GROUPE") {
      await db.groupe.update({
        where: { id: target.id },
        data: { arriveAuSalonA: now },
      });
    } else if (target.kind === "JEUNE") {
      await db.jeune.update({
        where: { id: target.id },
        data: { arriveAuSalonA: now },
      });
    } else if (target.kind === "DE") {
      await db.demandeurEmploi.update({
        where: { id: target.id },
        data: { arriveAuSalonA: now },
      });
    }

    await db.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "entree.salon",
        entite: target.kind,
        entiteId: target.id,
      },
    });
  }

  revalidatePath("/admin/live");
  revalidatePath("/admin/scan");

  return {
    ok: true,
    kind: target.kind,
    label: target.label,
    sousTitre: target.sousTitre,
    deja,
    horodatage: (target.arriveAuSalonA ?? now).toISOString(),
  };
}
