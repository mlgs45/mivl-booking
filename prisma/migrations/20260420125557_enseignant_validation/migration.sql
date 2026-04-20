-- CreateEnum
CREATE TYPE "StatutEnseignant" AS ENUM ('SOUMIS', 'VALIDE', 'REFUSE');

-- AlterTable
ALTER TABLE "Enseignant" ADD COLUMN     "motifRefus" TEXT,
ADD COLUMN     "statut" "StatutEnseignant" NOT NULL DEFAULT 'SOUMIS',
ADD COLUMN     "valideA" TIMESTAMP(3),
ADD COLUMN     "valideParId" TEXT;

-- CreateIndex
CREATE INDEX "Enseignant_statut_idx" ON "Enseignant"("statut");
