-- AlterEnum
ALTER TYPE "StatutExposant" ADD VALUE 'LISTE_ATTENTE';

-- AlterTable
ALTER TABLE "Exposant" ADD COLUMN "listeAttenteA" TIMESTAMP(3),
                       ADD COLUMN "messageListeAttente" TEXT;
