-- Personnes d'accueil nommées par l'exposant (spécification « Parcours collèges du matin » §2).
-- Additif : aucune ligne existante n'est modifiée, valeur par défaut = liste vide.
ALTER TABLE "Exposant"
  ADD COLUMN "nomsRessourcesMatin"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "nomsRessourcesApresMidi" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
