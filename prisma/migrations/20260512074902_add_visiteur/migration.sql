-- CreateTable
CREATE TABLE "Visiteur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "rgpdConsentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visiteur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visiteur_email_key" ON "Visiteur"("email");

-- CreateIndex
CREATE INDEX "Visiteur_createdAt_idx" ON "Visiteur"("createdAt");
