-- AlterTable
ALTER TABLE "Exposant" ADD COLUMN     "estPartenaire" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Exposant_estPartenaire_idx" ON "Exposant"("estPartenaire");
