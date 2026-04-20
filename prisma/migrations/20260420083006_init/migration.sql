-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'GESTIONNAIRE', 'EXPOSANT', 'ENSEIGNANT', 'JEUNE', 'DEMANDEUR_EMPLOI');

-- CreateEnum
CREATE TYPE "StatutExposant" AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "TypeOffre" AS ENUM ('DECOUVERTE_ENTREPRISE', 'DECOUVERTE_METIERS', 'OPPORTUNITES');

-- CreateEnum
CREATE TYPE "TypeOpportunite" AS ENUM ('STAGE_3E', 'STAGE_SECONDE', 'STAGE_BTS', 'STAGE_LICENCE', 'STAGE_MASTER', 'APPRENTISSAGE', 'ALTERNANCE', 'CDD', 'CDI', 'JOB_ETE', 'DECOUVERTE');

-- CreateEnum
CREATE TYPE "NiveauGroupe" AS ENUM ('QUATRIEME', 'TROISIEME', 'SECONDE');

-- CreateEnum
CREATE TYPE "TypeCreneau" AS ENUM ('GROUPE_MATIN', 'SPEED_DATING');

-- CreateEnum
CREATE TYPE "TypeRdv" AS ENUM ('GROUPE', 'SPEED_DATING');

-- CreateEnum
CREATE TYPE "StatutRdv" AS ENUM ('CONFIRME', 'PRESENT', 'ABSENT', 'ANNULE');

-- CreateEnum
CREATE TYPE "ProfilScanne" AS ENUM ('GROUPE', 'JEUNE', 'DE', 'ENSEIGNANT', 'WALK_IN');

-- CreateEnum
CREATE TYPE "StatutEmail" AS ENUM ('EN_ATTENTE', 'ENVOYE', 'ERREUR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifie" TIMESTAMP(3),
    "role" "Role" NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exposant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT,
    "secteur" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT,
    "description" TEXT NOT NULL,
    "siteWeb" TEXT,
    "logoUrl" TEXT,
    "offres" "TypeOffre"[],
    "typesOpportunites" "TypeOpportunite"[],
    "metiersProposes" TEXT[],
    "ressourcesMatin" INTEGER NOT NULL DEFAULT 1,
    "ressourcesApresMidi" INTEGER NOT NULL DEFAULT 1,
    "quotaGroupesMatinParCreneau" INTEGER NOT NULL DEFAULT 1,
    "quotaGroupesMatinTotal" INTEGER NOT NULL DEFAULT 10,
    "statut" "StatutExposant" NOT NULL DEFAULT 'BROUILLON',
    "motifRefus" TEXT,
    "valideParId" TEXT,
    "valideA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exposant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "etablissement" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "matiere" TEXT,
    "niveau" "NiveauGroupe",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "id" TEXT NOT NULL,
    "enseignantId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "niveau" "NiveauGroupe" NOT NULL,
    "tailleEffective" INTEGER NOT NULL,
    "prenomsEleves" TEXT[],
    "creneauArrivee" TEXT,
    "qrCodeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jeune" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dateNaissance" DATE NOT NULL,
    "niveauEtudes" TEXT NOT NULL,
    "etablissement" TEXT,
    "metiersInteret" TEXT[],
    "secteurInteret" TEXT[],
    "cvUrl" TEXT,
    "linkedinUrl" TEXT,
    "qrCodeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jeune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeurEmploi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "agencePoleEmploi" TEXT,
    "metiersRecherche" TEXT[],
    "secteurRecherche" TEXT[],
    "cvUrl" TEXT,
    "qrCodeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeurEmploi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creneau" (
    "id" TEXT NOT NULL,
    "exposantId" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "type" "TypeCreneau" NOT NULL,
    "ressourceIndex" INTEGER NOT NULL DEFAULT 1,
    "capaciteMax" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creneau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL,
    "creneauId" TEXT NOT NULL,
    "type" "TypeRdv" NOT NULL,
    "groupeId" TEXT,
    "jeuneId" TEXT,
    "demandeurEmploiId" TEXT,
    "statut" "StatutRdv" NOT NULL DEFAULT 'CONFIRME',
    "noteVisiteur" TEXT,
    "noteExposant" TEXT,
    "annuleA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanEntreeStand" (
    "id" TEXT NOT NULL,
    "rendezVousId" TEXT,
    "exposantId" TEXT NOT NULL,
    "profilScanne" "ProfilScanne" NOT NULL,
    "identifiantScanne" TEXT NOT NULL,
    "scanneA" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanEntreeStand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "statut" "StatutEmail" NOT NULL DEFAULT 'EN_ATTENTE',
    "envoyeA" TIMESTAMP(3),
    "erreur" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "payload" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigurationSalon" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dateSalon" DATE NOT NULL,
    "heureDebutMatin" TEXT NOT NULL,
    "heureFinMatin" TEXT NOT NULL,
    "dureeRdvGroupeMinutes" INTEGER NOT NULL DEFAULT 20,
    "dureeTransitionGroupeMinutes" INTEGER NOT NULL DEFAULT 10,
    "nbRdvParParcoursGroupe" INTEGER NOT NULL DEFAULT 4,
    "creneauxArriveeMatin" TEXT[],
    "heureDebutApresMidi" TEXT NOT NULL,
    "heureFinApresMidi" TEXT NOT NULL,
    "dureeSpeedDatingMinutes" INTEGER NOT NULL DEFAULT 5,
    "dureeTransitionSpeedDatingMinutes" INTEGER NOT NULL DEFAULT 5,
    "maxRdvParVisiteur" INTEGER NOT NULL DEFAULT 6,
    "inscriptionsExposantsOuvertes" BOOLEAN NOT NULL DEFAULT false,
    "inscriptionsVisiteursOuvertes" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigurationSalon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Exposant_userId_key" ON "Exposant"("userId");

-- CreateIndex
CREATE INDEX "Exposant_statut_idx" ON "Exposant"("statut");

-- CreateIndex
CREATE INDEX "Exposant_secteur_idx" ON "Exposant"("secteur");

-- CreateIndex
CREATE INDEX "Exposant_ville_idx" ON "Exposant"("ville");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_userId_key" ON "Enseignant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Groupe_qrCodeToken_key" ON "Groupe"("qrCodeToken");

-- CreateIndex
CREATE INDEX "Groupe_enseignantId_idx" ON "Groupe"("enseignantId");

-- CreateIndex
CREATE UNIQUE INDEX "Jeune_userId_key" ON "Jeune"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Jeune_qrCodeToken_key" ON "Jeune"("qrCodeToken");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeurEmploi_userId_key" ON "DemandeurEmploi"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeurEmploi_qrCodeToken_key" ON "DemandeurEmploi"("qrCodeToken");

-- CreateIndex
CREATE INDEX "Creneau_exposantId_debut_idx" ON "Creneau"("exposantId", "debut");

-- CreateIndex
CREATE INDEX "Creneau_debut_idx" ON "Creneau"("debut");

-- CreateIndex
CREATE INDEX "Creneau_type_debut_idx" ON "Creneau"("type", "debut");

-- CreateIndex
CREATE UNIQUE INDEX "Creneau_exposantId_debut_ressourceIndex_key" ON "Creneau"("exposantId", "debut", "ressourceIndex");

-- CreateIndex
CREATE INDEX "RendezVous_creneauId_idx" ON "RendezVous"("creneauId");

-- CreateIndex
CREATE INDEX "RendezVous_groupeId_idx" ON "RendezVous"("groupeId");

-- CreateIndex
CREATE INDEX "RendezVous_jeuneId_idx" ON "RendezVous"("jeuneId");

-- CreateIndex
CREATE INDEX "RendezVous_demandeurEmploiId_idx" ON "RendezVous"("demandeurEmploiId");

-- CreateIndex
CREATE INDEX "RendezVous_statut_idx" ON "RendezVous"("statut");

-- CreateIndex
CREATE INDEX "ScanEntreeStand_exposantId_scanneA_idx" ON "ScanEntreeStand"("exposantId", "scanneA");

-- CreateIndex
CREATE INDEX "ScanEntreeStand_rendezVousId_idx" ON "ScanEntreeStand"("rendezVousId");

-- CreateIndex
CREATE INDEX "ScanEntreeStand_profilScanne_idx" ON "ScanEntreeStand"("profilScanne");

-- CreateIndex
CREATE INDEX "EmailLog_statut_idx" ON "EmailLog"("statut");

-- CreateIndex
CREATE INDEX "EmailLog_destinataire_idx" ON "EmailLog"("destinataire");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entite_entiteId_idx" ON "AuditLog"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Exposant" ADD CONSTRAINT "Exposant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jeune" ADD CONSTRAINT "Jeune_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeurEmploi" ADD CONSTRAINT "DemandeurEmploi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneau" ADD CONSTRAINT "Creneau_exposantId_fkey" FOREIGN KEY ("exposantId") REFERENCES "Exposant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "Creneau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_jeuneId_fkey" FOREIGN KEY ("jeuneId") REFERENCES "Jeune"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_demandeurEmploiId_fkey" FOREIGN KEY ("demandeurEmploiId") REFERENCES "DemandeurEmploi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEntreeStand" ADD CONSTRAINT "ScanEntreeStand_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEntreeStand" ADD CONSTRAINT "ScanEntreeStand_exposantId_fkey" FOREIGN KEY ("exposantId") REFERENCES "Exposant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
