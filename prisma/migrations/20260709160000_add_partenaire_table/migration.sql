-- CreateTable
CREATE TABLE "Partenaire" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomOrganisation" TEXT NOT NULL,
    "prenomContact" TEXT NOT NULL,
    "nomContact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partenaire_userId_key" ON "Partenaire"("userId");

-- AddForeignKey
ALTER TABLE "Partenaire" ADD CONSTRAINT "Partenaire_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
