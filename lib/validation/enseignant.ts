import { z } from "zod";

export const inscriptionEnseignantSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide").toLowerCase().trim(),
  prenom: z.string().min(1, "Prénom requis").max(60).trim(),
  nom: z.string().min(1, "Nom requis").max(60).trim(),
  etablissement: z.string().min(2, "Établissement requis").max(200).trim(),
  ville: z.string().min(1, "Ville requise").max(100).trim(),
  matiere: z.string().max(100).trim().optional().or(z.literal("")),
  niveau: z.enum(["QUATRIEME", "TROISIEME", "SECONDE"]).optional(),
  rgpdConsent: z.literal("on", { message: "Vous devez accepter la politique de confidentialité" }),
});

export type InscriptionEnseignantInput = z.infer<typeof inscriptionEnseignantSchema>;

export const groupeSchema = z.object({
  nom: z.string().trim().min(1, "Nom du groupe requis (ex: 4eB)").max(20, "Nom trop long"),
  niveau: z.enum(["QUATRIEME", "TROISIEME", "SECONDE"], { message: "Niveau requis" }),
  tailleEffective: z.coerce.number().int().min(1, "Au moins 1 élève").max(35, "Max 35 élèves"),
  prenomsEleves: z.array(z.string().trim().min(1).max(40)).max(35),
  creneauArrivee: z.enum(["09:00", "09:15", "09:30"], { message: "Créneau d'arrivée requis" }),
});

export type GroupeInput = z.infer<typeof groupeSchema>;
