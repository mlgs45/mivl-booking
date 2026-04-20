-- AlterTable
ALTER TABLE "DemandeurEmploi" ADD COLUMN     "arriveAuSalonA" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Groupe" ADD COLUMN     "arriveAuSalonA" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Jeune" ADD COLUMN     "arriveAuSalonA" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScanEntreeStand" ADD COLUMN     "walkInNom" TEXT,
ADD COLUMN     "walkInPrenom" TEXT,
ADD COLUMN     "walkInProfil" TEXT;

-- CreateIndex
CREATE INDEX "DemandeurEmploi_arriveAuSalonA_idx" ON "DemandeurEmploi"("arriveAuSalonA");

-- CreateIndex
CREATE INDEX "Groupe_arriveAuSalonA_idx" ON "Groupe"("arriveAuSalonA");

-- CreateIndex
CREATE INDEX "Jeune_arriveAuSalonA_idx" ON "Jeune"("arriveAuSalonA");
