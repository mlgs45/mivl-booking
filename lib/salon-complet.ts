import { db } from "@/lib/db";

/**
 * Salon complet côté exposants : les 120 stands sont attribués. Le drapeau est
 * purement informatif — les inscriptions et les soumissions restent ouvertes,
 * mais l'entreprise est prévenue en amont que sa candidature partira en liste
 * d'attente (la décision reste prise dossier par dossier par la CCI).
 *
 * Piloté depuis /admin/configuration.
 */
export async function getSalonCompletExposants(): Promise<boolean> {
  const config = await db.configurationSalon.findUnique({
    where: { id: 1 },
    select: { salonCompletExposants: true },
  });
  return config?.salonCompletExposants ?? false;
}
