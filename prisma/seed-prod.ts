/**
 * Seed de production — idempotent.
 *
 * Crée (ou met à jour) uniquement les données structurelles nécessaires :
 *   - 1 configuration de salon
 *   - 1 super admin depuis SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD
 *
 * Aucune donnée de démo. Aucun deleteMany. Peut être relancé sans risque.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const db = new PrismaClient();

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const DATE_SALON_ISO =
  process.env.DATE_SALON_ISO ?? "2026-10-15T00:00:00.000Z";

async function main() {
  if (!SUPER_ADMIN_EMAIL) {
    throw new Error("SUPER_ADMIN_EMAIL manquant dans l'environnement.");
  }
  if (!SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD manquant. Générer : openssl rand -base64 24",
    );
  }

  console.log("🌱 MIVL Connect — seed prod");

  await db.configurationSalon.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      dateSalon: new Date(DATE_SALON_ISO),
      heureDebutMatin: "09:00",
      heureFinMatin: "12:00",
      dureeRdvGroupeMinutes: 20,
      dureeTransitionGroupeMinutes: 10,
      nbRdvParParcoursGroupe: 4,
      creneauxArriveeMatin: ["09:00", "09:15", "09:30"],
      heureDebutApresMidi: "14:00",
      heureFinApresMidi: "18:00",
      dureeSpeedDatingMinutes: 5,
      dureeTransitionSpeedDatingMinutes: 5,
      maxRdvParVisiteur: 6,
      inscriptionsExposantsOuvertes: true,
      inscriptionsVisiteursOuvertes: true,
    },
  });
  console.log("✓ ConfigurationSalon prête");

  const passwordHash = await hash(SUPER_ADMIN_PASSWORD);
  const email = SUPER_ADMIN_EMAIL.toLowerCase();

  await db.user.upsert({
    where: { email },
    update: {
      role: "SUPER_ADMIN",
      hashedPassword: passwordHash,
      emailVerified: new Date(),
    },
    create: {
      email,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      hashedPassword: passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Super admin : ${email}`);

  console.log("✅ Seed prod terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
