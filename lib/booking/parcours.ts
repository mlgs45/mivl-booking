/**
 * Moteur de réservation — parcours matin (groupes scolaires).
 *
 * Règles métier :
 * - Un groupe arrive à creneauArrivee ("09:00" | "09:15" | "09:30")
 * - Le parcours = 4 RDV consécutifs de 20 min + 10 min de transition → 30 min entre deux débuts
 * - Horaires cibles : arrivée + 0, 30, 60, 90 min
 * - L'enseignant fournit 4 exposants distincts, dans l'ordre de visite
 * - Pour chaque exposant au créneau cible, on prend la 1re ressource libre (capaciteMax=1 par ressource)
 * - Si un exposant est plein à l'horaire cible → échec avec l'exposant fautif
 * - Respect du quotaGroupesMatinTotal par exposant
 */

import { addMinutes } from "date-fns";
import { db } from "@/lib/db";

export type ReserverParcoursResult =
  | { ok: true; rdvIds: string[] }
  | { ok: false; error: string };

const SLOT_DURATION_MIN = 30;
const PARCOURS_LENGTH = 4;

export async function reserverParcours(
  groupeId: string,
  exposantIds: string[],
): Promise<ReserverParcoursResult> {
  if (exposantIds.length !== PARCOURS_LENGTH) {
    return { ok: false, error: "Il faut sélectionner exactement 4 exposants." };
  }
  if (new Set(exposantIds).size !== PARCOURS_LENGTH) {
    return { ok: false, error: "Chaque exposant ne peut être choisi qu'une fois." };
  }

  const groupe = await db.groupe.findUnique({
    where: { id: groupeId },
    select: { id: true, creneauArrivee: true, tailleEffective: true },
  });
  if (!groupe) return { ok: false, error: "Groupe introuvable." };
  if (!groupe.creneauArrivee) {
    return { ok: false, error: "Ce groupe n'a pas de créneau d'arrivée défini." };
  }

  const existingActive = await db.rendezVous.count({
    where: {
      groupeId,
      statut: { not: "ANNULE" },
    },
  });
  if (existingActive > 0) {
    return { ok: false, error: "Ce groupe a déjà un parcours actif. Annulez-le avant d'en créer un nouveau." };
  }

  const config = await db.configurationSalon.findFirst({ select: { dateSalon: true } });
  if (!config) return { ok: false, error: "Configuration salon introuvable." };

  const [h, m] = groupe.creneauArrivee.split(":").map(Number);
  const baseDate = new Date(config.dateSalon);
  baseDate.setUTCHours(h ?? 0, m ?? 0, 0, 0);

  const targetTimes = Array.from({ length: PARCOURS_LENGTH }, (_, i) =>
    addMinutes(baseDate, i * SLOT_DURATION_MIN),
  );

  try {
    const rdvIds = await db.$transaction(async (tx) => {
      const created: string[] = [];

      for (let i = 0; i < PARCOURS_LENGTH; i++) {
        const exposantId = exposantIds[i]!;
        const targetTime = targetTimes[i]!;

        const exposant = await tx.exposant.findUnique({
          where: { id: exposantId },
          select: { id: true, raisonSociale: true, statut: true, quotaGroupesMatinTotal: true },
        });
        if (!exposant || exposant.statut !== "VALIDE") {
          throw new BookingError(`Exposant non valide pour le parcours.`);
        }

        const totalActifs = await tx.rendezVous.count({
          where: {
            creneau: { exposantId, type: "GROUPE_MATIN" },
            statut: { not: "ANNULE" },
          },
        });
        if (totalActifs >= exposant.quotaGroupesMatinTotal) {
          throw new BookingError(
            `${exposant.raisonSociale} a atteint son quota de groupes sur la matinée.`,
          );
        }

        const creneauxDispos = await tx.creneau.findMany({
          where: {
            exposantId,
            type: "GROUPE_MATIN",
            debut: targetTime,
            rendezVous: { none: { statut: { not: "ANNULE" } } },
          },
          orderBy: { ressourceIndex: "asc" },
          take: 1,
        });

        const slot = creneauxDispos[0];
        if (!slot) {
          const heureLbl = targetTime
            .toISOString()
            .slice(11, 16);
          throw new BookingError(
            `${exposant.raisonSociale} n'est pas disponible à ${heureLbl}. Choisissez un autre exposant pour ce créneau.`,
          );
        }

        const rdv = await tx.rendezVous.create({
          data: {
            creneauId: slot.id,
            type: "GROUPE",
            groupeId: groupe.id,
            statut: "CONFIRME",
          },
          select: { id: true },
        });
        created.push(rdv.id);
      }

      return created;
    });

    return { ok: true, rdvIds };
  } catch (err) {
    if (err instanceof BookingError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
}

class BookingError extends Error {}

export async function annulerParcoursGroupe(groupeId: string): Promise<void> {
  await db.rendezVous.updateMany({
    where: { groupeId, statut: { not: "ANNULE" } },
    data: { statut: "ANNULE", annuleA: new Date() },
  });
}
