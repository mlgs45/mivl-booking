-- Garantit qu'un RendezVous référence exactement UN visiteur parmi groupe / jeune / demandeurEmploi.
-- Sans cette contrainte, Prisma ne peut pas forcer l'exclusivité au niveau schéma.

ALTER TABLE "RendezVous"
  ADD CONSTRAINT "RendezVous_visiteur_xor_check"
  CHECK (
    (("groupeId" IS NOT NULL)::int
   + ("jeuneId" IS NOT NULL)::int
   + ("demandeurEmploiId" IS NOT NULL)::int) = 1
  );
