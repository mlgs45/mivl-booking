/*
  Warnings:

  - A unique constraint covering the columns `[numStand]` on the table `Exposant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exposant" ADD COLUMN     "accrocheStand" TEXT,
ADD COLUMN     "emplacement" TEXT,
ADD COLUMN     "nomStand" TEXT,
ADD COLUMN     "numStand" TEXT,
ADD COLUMN     "superficie" INTEGER;

-- CreateTable
CREATE TABLE "MembreStand" (
    "id" TEXT NOT NULL,
    "exposantId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "fonction" TEXT,
    "qrToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembreStand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembreStand_qrToken_key" ON "MembreStand"("qrToken");

-- CreateIndex
CREATE INDEX "MembreStand_exposantId_idx" ON "MembreStand"("exposantId");

-- CreateIndex
CREATE UNIQUE INDEX "Exposant_numStand_key" ON "Exposant"("numStand");

-- AddForeignKey
ALTER TABLE "MembreStand" ADD CONSTRAINT "MembreStand_exposantId_fkey" FOREIGN KEY ("exposantId") REFERENCES "Exposant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
