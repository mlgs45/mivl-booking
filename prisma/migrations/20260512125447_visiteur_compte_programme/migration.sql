-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'VISITEUR';

-- AlterTable
ALTER TABLE "Visiteur"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "exposantsFavoris" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Visiteur_userId_key" ON "Visiteur"("userId");

-- AddForeignKey
ALTER TABLE "Visiteur" ADD CONSTRAINT "Visiteur_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
