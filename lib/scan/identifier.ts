import { db } from "@/lib/db";

export type ScanTarget =
  | {
      kind: "GROUPE";
      id: string;
      token: string;
      label: string; // ex: "4eB — 24 élèves"
      sousTitre: string; // ex: "Collège Jean Moulin · Mme Durand"
      tailleEffective: number;
      arriveAuSalonA: Date | null;
    }
  | {
      kind: "JEUNE";
      id: string;
      token: string;
      label: string;
      sousTitre: string;
      arriveAuSalonA: Date | null;
    }
  | {
      kind: "DE";
      id: string;
      token: string;
      label: string;
      sousTitre: string;
      arriveAuSalonA: Date | null;
    }
  | {
      kind: "MEMBRE_STAND";
      id: string;
      token: string;
      label: string;
      sousTitre: string;
      exposantId: string;
    };

export async function identifierToken(
  tokenRaw: string,
): Promise<ScanTarget | null> {
  const token = tokenRaw.trim();
  if (!token) return null;

  const [groupe, jeune, de, membre] = await Promise.all([
    db.groupe.findUnique({
      where: { qrCodeToken: token },
      select: {
        id: true,
        nom: true,
        niveau: true,
        tailleEffective: true,
        arriveAuSalonA: true,
        qrCodeToken: true,
        enseignant: {
          select: { prenom: true, nom: true, etablissement: true },
        },
      },
    }),
    db.jeune.findUnique({
      where: { qrCodeToken: token },
      select: {
        id: true,
        prenom: true,
        nom: true,
        niveauEtudes: true,
        etablissement: true,
        arriveAuSalonA: true,
        qrCodeToken: true,
      },
    }),
    db.demandeurEmploi.findUnique({
      where: { qrCodeToken: token },
      select: {
        id: true,
        prenom: true,
        nom: true,
        agencePoleEmploi: true,
        arriveAuSalonA: true,
        qrCodeToken: true,
      },
    }),
    db.membreStand.findUnique({
      where: { qrToken: token },
      select: {
        id: true,
        prenom: true,
        nom: true,
        fonction: true,
        exposantId: true,
        qrToken: true,
        exposant: { select: { raisonSociale: true } },
      },
    }),
  ]);

  if (groupe) {
    return {
      kind: "GROUPE",
      id: groupe.id,
      token: groupe.qrCodeToken,
      label: `${groupe.nom} — ${groupe.tailleEffective} élève${groupe.tailleEffective > 1 ? "s" : ""}`,
      sousTitre: `${groupe.enseignant.etablissement} · ${groupe.enseignant.prenom} ${groupe.enseignant.nom}`,
      tailleEffective: groupe.tailleEffective,
      arriveAuSalonA: groupe.arriveAuSalonA,
    };
  }
  if (jeune) {
    return {
      kind: "JEUNE",
      id: jeune.id,
      token: jeune.qrCodeToken,
      label: `${jeune.prenom} ${jeune.nom}`,
      sousTitre: [jeune.niveauEtudes, jeune.etablissement]
        .filter(Boolean)
        .join(" · "),
      arriveAuSalonA: jeune.arriveAuSalonA,
    };
  }
  if (de) {
    return {
      kind: "DE",
      id: de.id,
      token: de.qrCodeToken,
      label: `${de.prenom} ${de.nom}`,
      sousTitre: de.agencePoleEmploi
        ? `Demandeur d'emploi · ${de.agencePoleEmploi}`
        : "Demandeur d'emploi",
      arriveAuSalonA: de.arriveAuSalonA,
    };
  }
  if (membre) {
    return {
      kind: "MEMBRE_STAND",
      id: membre.id,
      token: membre.qrToken,
      label: `${membre.prenom} ${membre.nom}`,
      sousTitre: [membre.fonction, membre.exposant.raisonSociale]
        .filter(Boolean)
        .join(" · "),
      exposantId: membre.exposantId,
    };
  }

  return null;
}
