/**
 * Nettoyage des données de démo injectées par prisma/seed.ts.
 *
 * Supprime strictement les comptes listés (gestionnaire fictif, exposants
 * démos, enseignants démos, 10 jeunes démos, 2 DE démos). Grâce aux
 * cascades ON DELETE du schéma, tous les enregistrements liés (Exposant,
 * Enseignant, Groupe, Jeune, DemandeurEmploi, Creneau, RendezVous,
 * MembreStand, ScanEntreeStand, AuditLog, EmailLog) partent avec.
 *
 * Sûr à relancer : no-op si les emails n'existent plus.
 * Ne touche pas :
 *   - Le super admin (SUPER_ADMIN_EMAIL)
 *   - La ConfigurationSalon
 *   - Tout compte réel créé depuis la prod (différent des emails ci-dessous)
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SEED_EMAILS = [
  // Gestionnaire fictif
  "gestionnaire@cci-centre.fr",
  // Exposants démos
  "contact@thalesmecanique.fr",
  "rh@cosmetique-loire.fr",
  "emploi@plastiloire.fr",
  "recrutement@metallurgie-bourges.fr",
  "dev@numeric-tours.fr",
  // Enseignants démos
  "profhistoire@college-jean-rostand.fr",
  "profsvt@lycee-benjamin-franklin.fr",
  // Jeunes démos
  "lea.martin@example.fr",
  "mathis.petit@example.fr",
  "emma.durand@example.fr",
  "yanis.bernard@example.fr",
  "chloe.thomas@example.fr",
  "noah.robert@example.fr",
  "sara.richard@example.fr",
  "lucas.michel@example.fr",
  "jade.laurent@example.fr",
  "hugo.simon@example.fr",
  // Demandeurs d'emploi démos
  "sophie.gauthier@example.fr",
  "karim.benali@example.fr",
];

async function main() {
  console.log("🧹 MIVL Connect — nettoyage seed dev");

  const existing = await db.user.findMany({
    where: { email: { in: SEED_EMAILS } },
    select: { email: true, role: true },
  });

  if (existing.length === 0) {
    console.log("✓ Aucun compte seed trouvé — rien à faire.");
    return;
  }

  console.log(`→ ${existing.length} compte(s) seed trouvé(s) :`);
  for (const u of existing) console.log(`   - ${u.email} (${u.role})`);

  const result = await db.user.deleteMany({
    where: { email: { in: SEED_EMAILS } },
  });

  console.log(`✅ ${result.count} utilisateur(s) supprimé(s) (cascade appliquée).`);
}

main()
  .catch((e) => {
    console.error("❌ Échec du nettoyage :", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
