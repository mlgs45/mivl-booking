/*
  Warnings:

  - You are about to drop the column `secteur` on the `Exposant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutRecrutement" AS ENUM ('OUI', 'NON', 'PROCHAINEMENT');

-- DropIndex
DROP INDEX "Exposant_secteur_idx";

-- AlterTable
ALTER TABLE "Exposant" DROP COLUMN "secteur",
ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "animations" TEXT[],
ADD COLUMN     "consentementCommunication" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "descriptionInnovation" TEXT,
ADD COLUMN     "elementsStand" TEXT[],
ADD COLUMN     "elementsStandAutre" TEXT,
ADD COLUMN     "fonctionContact" TEXT,
ADD COLUMN     "innovationMiseEnAvant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secteurAutre" TEXT,
ADD COLUMN     "secteurs" TEXT[],
ADD COLUMN     "statutRecrutement" "StatutRecrutement" NOT NULL DEFAULT 'NON',
ADD COLUMN     "telephoneContact" TEXT;
