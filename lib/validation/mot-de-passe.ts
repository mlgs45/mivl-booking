import { z } from "zod";

/**
 * Règle de mot de passe commune à tous les comptes de la plateforme.
 *
 * Elle applique la recommandation CNIL 2024 pour les cas sans authentification
 * à double facteur : 12 caractères minimum, comprenant majuscule, minuscule,
 * chiffre et caractère spécial.
 *
 * Elle ne s'applique qu'à la *définition* d'un mot de passe — inscription,
 * lien de définition, réinitialisation. La connexion ne la vérifie pas
 * (`auth.ts`), sans quoi les comptes créés avant cette règle ne pourraient
 * plus se connecter. Les mots de passe existants restent donc valables
 * jusqu'à ce que leur titulaire en change.
 */
export const motDePasseSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
  .max(200, "Mot de passe trop long.")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
  .regex(
    /[^a-zA-Z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial.",
  );
