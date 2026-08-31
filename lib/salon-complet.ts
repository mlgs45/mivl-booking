import { db } from "@/lib/db";

/**
 * Salon complet côté exposants : les 120 stands sont attribués. Le drapeau est
 * purement informatif — les inscriptions et les soumissions restent ouvertes,
 * mais l'entreprise est prévenue en amont que sa candidature partira en liste
 * d'attente (la décision reste prise dossier par dossier par la CCI).
 *
 * Piloté depuis /admin/configuration.
 *
 * Tolérant à la panne, et ce n'est pas de la coquetterie : `next build` se
 * connecte à la base de prod pour prérendre /inscription et
 * /inscription/exposant, alors que `prisma migrate deploy` ne tourne qu'au
 * démarrage du conteneur (cf. CMD du Dockerfile). Au premier déploiement
 * portant cette colonne, le build interroge donc une base qui ne l'a pas
 * encore : sans ce filet, le build échoue, le conteneur ne démarre pas, la
 * migration n'est jamais appliquée — blocage circulaire. On dégrade vers
 * "salon non complet", qui est l'état par défaut de la colonne.
 */
export async function getSalonCompletExposants(): Promise<boolean> {
  try {
    const config = await db.configurationSalon.findUnique({
      where: { id: 1 },
      select: { salonCompletExposants: true },
    });
    return config?.salonCompletExposants ?? false;
  } catch {
    return false;
  }
}
