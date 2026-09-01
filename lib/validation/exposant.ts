import { z } from "zod";
import { motDePasseSchema } from "./mot-de-passe";

export const inscriptionExposantSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide")
    .toLowerCase()
    .trim(),
  prenom: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100, "Prénom trop long")
    .trim(),
  nom: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Nom trop long")
    .trim(),
  raisonSociale: z
    .string()
    .min(2, "Raison sociale trop courte")
    .max(200, "Raison sociale trop longue")
    .trim(),
  ville: z
    .string()
    .min(1, "La ville est requise")
    .max(100, "Ville trop longue")
    .trim(),
  codePostal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide")
    .optional()
    .or(z.literal("")),
  rgpdConsent: z.literal("on", {
    message: "Vous devez prendre connaissance des informations sur le traitement de vos données.",
  }),
  motDePasse: motDePasseSchema,
  confirmation: z.string().min(1, "Confirmation requise."),
}).refine((v) => v.motDePasse === v.confirmation, {
  path: ["confirmation"],
  message: "Les deux mots de passe ne correspondent pas.",
});

export type InscriptionExposantInput = z.infer<typeof inscriptionExposantSchema>;
