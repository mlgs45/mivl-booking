"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { identifierToken } from "@/lib/scan/identifier";
import type { ProfilScanne, StatutRdv } from "@prisma/client";

export type ScanStandResult =
  | {
      ok: true;
      label: string;
      sousTitre: string;
      /** "PRESENT" quand on a pointé un RDV, "WALK_IN" sinon */
      mode: "PRESENT" | "WALK_IN";
      /** Infos sur le RDV pointé (si mode=PRESENT) */
      horaire?: string;
      /** Déjà scanné sur ce stand dans les 2 dernières minutes */
      deja: boolean;
    }
  | { ok: false; message: string };

async function getExposantId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EXPOSANT") return null;
  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true },
  });
  if (!exposant || exposant.statut !== "VALIDE") return null;
  return exposant.id;
}

function fmtHeure(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export async function scannerVisiteurStand(
  tokenRaw: string,
): Promise<ScanStandResult> {
  const exposantId = await getExposantId();
  if (!exposantId) return { ok: false, message: "Non autorisé." };

  const target = await identifierToken(tokenRaw);
  if (!target) return { ok: false, message: "QR code inconnu." };

  if (target.kind === "MEMBRE_STAND") {
    return { ok: false, message: "Badge équipe — utiliser l'entrée salon." };
  }

  // Dédoublonnage : scan identique dans les 2 dernières minutes ? → considéré comme déjà scanné.
  const recent = await db.scanEntreeStand.findFirst({
    where: {
      exposantId,
      identifiantScanne: target.token,
      scanneA: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
    orderBy: { scanneA: "desc" },
    select: { id: true, rendezVousId: true },
  });
  if (recent) {
    return {
      ok: true,
      label: target.label,
      sousTitre: target.sousTitre,
      mode: recent.rendezVousId ? "PRESENT" : "WALK_IN",
      deja: true,
    };
  }

  // Cherche un RDV CONFIRME sur ce stand aujourd'hui pour ce visiteur.
  const baseFilter = {
    creneau: { exposantId },
    statut: "CONFIRME" as StatutRdv,
  };
  const rdv = await db.rendezVous.findFirst({
    where:
      target.kind === "GROUPE"
        ? { ...baseFilter, groupeId: target.id }
        : target.kind === "JEUNE"
          ? { ...baseFilter, jeuneId: target.id }
          : { ...baseFilter, demandeurEmploiId: target.id },
    orderBy: { creneau: { debut: "asc" } },
    include: {
      creneau: { select: { debut: true, fin: true } },
    },
  });

  const profilScanne: ProfilScanne =
    target.kind === "GROUPE"
      ? "GROUPE"
      : target.kind === "JEUNE"
        ? "JEUNE"
        : "DE";

  if (rdv) {
    await db.$transaction([
      db.rendezVous.update({
        where: { id: rdv.id },
        data: { statut: "PRESENT" },
      }),
      db.scanEntreeStand.create({
        data: {
          exposantId,
          rendezVousId: rdv.id,
          profilScanne,
          identifiantScanne: target.token,
        },
      }),
    ]);

    revalidatePath("/exposant/rdv");
    revalidatePath("/exposant/scan");

    return {
      ok: true,
      label: target.label,
      sousTitre: target.sousTitre,
      mode: "PRESENT",
      horaire: `${fmtHeure(rdv.creneau.debut)} – ${fmtHeure(rdv.creneau.fin)}`,
      deja: false,
    };
  }

  // Pas de RDV : walk-in identifié
  await db.scanEntreeStand.create({
    data: {
      exposantId,
      profilScanne,
      identifiantScanne: target.token,
    },
  });

  revalidatePath("/exposant/rdv");
  revalidatePath("/exposant/scan");

  return {
    ok: true,
    label: target.label,
    sousTitre: target.sousTitre,
    mode: "WALK_IN",
    deja: false,
  };
}

const walkInSchema = z.object({
  prenom: z.string().trim().max(60).optional(),
  nom: z.string().trim().max(60).optional(),
  profil: z.string().trim().max(120).optional(),
});

export type WalkInAnonymeResult =
  | { ok: true; label: string }
  | { ok: false; message: string };

export async function ajouterWalkInAnonyme(
  formData: FormData,
): Promise<WalkInAnonymeResult> {
  const exposantId = await getExposantId();
  if (!exposantId) return { ok: false, message: "Non autorisé." };

  const parsed = walkInSchema.safeParse({
    prenom: formData.get("prenom") ?? "",
    nom: formData.get("nom") ?? "",
    profil: formData.get("profil") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Données invalides." };
  }

  const prenom = parsed.data.prenom?.trim() || null;
  const nom = parsed.data.nom?.trim() || null;
  const profil = parsed.data.profil?.trim() || null;

  await db.scanEntreeStand.create({
    data: {
      exposantId,
      profilScanne: "WALK_IN",
      identifiantScanne: `walkin-anon-${crypto.randomUUID()}`,
      walkInPrenom: prenom,
      walkInNom: nom,
      walkInProfil: profil,
    },
  });

  revalidatePath("/exposant/rdv");
  revalidatePath("/exposant/scan");

  const nomAffiche = [prenom, nom].filter(Boolean).join(" ") || "Walk-in";
  return { ok: true, label: nomAffiche };
}
