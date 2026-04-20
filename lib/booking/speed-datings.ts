/**
 * Moteur de réservation — speed datings (après-midi).
 *
 * Règles :
 * - Un visiteur (jeune ou DE) peut choisir 1 à 6 exposants
 * - Chaque speed dating = 5 min + 5 min de transition → pas d'overlap entre deux RDV d'un même visiteur
 * - Pour chaque exposant demandé, on cherche le 1er créneau disponible qui ne chevauche pas
 * - Si un exposant n'a aucun créneau compatible → il est listé dans les échecs, les autres sont confirmés
 */

import { db } from "@/lib/db";

export type VisitorType = "JEUNE" | "DE";

export type ReserverSpeedDatingsResult = {
  confirmes: { exposantId: string; rdvId: string; debut: Date }[];
  echecs:    { exposantId: string; raisonSociale: string; raison: string }[];
};

const MAX_RDVS = 6;

export async function reserverSpeedDatings(
  visitor: { type: VisitorType; id: string },
  exposantIds: string[],
): Promise<ReserverSpeedDatingsResult> {
  if (exposantIds.length === 0 || exposantIds.length > MAX_RDVS) {
    return {
      confirmes: [],
      echecs: exposantIds.map((id) => ({
        exposantId: id,
        raisonSociale: "",
        raison: `Vous devez choisir entre 1 et ${MAX_RDVS} exposants.`,
      })),
    };
  }
  if (new Set(exposantIds).size !== exposantIds.length) {
    return {
      confirmes: [],
      echecs: [{ exposantId: "", raisonSociale: "", raison: "Chaque exposant ne peut être choisi qu'une fois." }],
    };
  }

  const existingRdvs = await db.rendezVous.findMany({
    where: {
      ...(visitor.type === "JEUNE" ? { jeuneId: visitor.id } : { demandeurEmploiId: visitor.id }),
      statut: { not: "ANNULE" },
      creneau: { type: "SPEED_DATING" },
    },
    include: { creneau: { select: { debut: true, fin: true, exposantId: true } } },
  });

  const alreadyBookedWith = new Set(existingRdvs.map((r) => r.creneau.exposantId));
  const busySlots: { debut: Date; fin: Date }[] = existingRdvs.map((r) => ({
    debut: r.creneau.debut,
    fin: r.creneau.fin,
  }));

  if (existingRdvs.length + exposantIds.length > MAX_RDVS) {
    return {
      confirmes: [],
      echecs: [{
        exposantId: "",
        raisonSociale: "",
        raison: `Vous avez déjà ${existingRdvs.length} RDV. Maximum ${MAX_RDVS} au total.`,
      }],
    };
  }

  const confirmes: ReserverSpeedDatingsResult["confirmes"] = [];
  const echecs:    ReserverSpeedDatingsResult["echecs"]    = [];

  for (const exposantId of exposantIds) {
    const exposant = await db.exposant.findUnique({
      where: { id: exposantId },
      select: { raisonSociale: true, statut: true },
    });
    if (!exposant || exposant.statut !== "VALIDE") {
      echecs.push({ exposantId, raisonSociale: exposant?.raisonSociale ?? "Exposant", raison: "Exposant non validé." });
      continue;
    }
    if (alreadyBookedWith.has(exposantId)) {
      echecs.push({ exposantId, raisonSociale: exposant.raisonSociale, raison: "Vous avez déjà un RDV avec cet exposant." });
      continue;
    }

    const disposibilités = await db.creneau.findMany({
      where: {
        exposantId,
        type: "SPEED_DATING",
        rendezVous: { none: { statut: { not: "ANNULE" } } },
      },
      orderBy: [{ debut: "asc" }, { ressourceIndex: "asc" }],
    });

    const slot = disposibilités.find((c) =>
      !busySlots.some((b) => overlap(b.debut, b.fin, c.debut, c.fin)),
    );

    if (!slot) {
      echecs.push({
        exposantId,
        raisonSociale: exposant.raisonSociale,
        raison: "Aucun créneau libre compatible avec vos RDV déjà réservés.",
      });
      continue;
    }

    try {
      const rdv = await db.$transaction(async (tx) => {
        const stillFree = await tx.rendezVous.count({
          where: { creneauId: slot.id, statut: { not: "ANNULE" } },
        });
        if (stillFree > 0) throw new Error("Créneau pris entre-temps.");
        return tx.rendezVous.create({
          data: {
            creneauId: slot.id,
            type: "SPEED_DATING",
            ...(visitor.type === "JEUNE"
              ? { jeuneId: visitor.id }
              : { demandeurEmploiId: visitor.id }),
            statut: "CONFIRME",
          },
          select: { id: true },
        });
      });

      confirmes.push({ exposantId, rdvId: rdv.id, debut: slot.debut });
      busySlots.push({ debut: slot.debut, fin: slot.fin });
      alreadyBookedWith.add(exposantId);
    } catch {
      echecs.push({
        exposantId,
        raisonSociale: exposant.raisonSociale,
        raison: "Le créneau a été pris par un autre visiteur, réessayez.",
      });
    }
  }

  return { confirmes, echecs };
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}
