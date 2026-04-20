import { z } from "zod";

const baseVisiteur = {
  email: z.string().min(1, "L'email est requis").email("Email invalide").toLowerCase().trim(),
  prenom: z.string().min(1, "Prénom requis").max(60).trim(),
  nom: z.string().min(1, "Nom requis").max(60).trim(),
  rgpdConsent: z.literal("on", { message: "Vous devez accepter la politique de confidentialité" }),
};

export const inscriptionJeuneSchema = z.object({
  ...baseVisiteur,
  niveauEtudes: z.string().trim().min(2, "Niveau d'études requis").max(100),
  etablissement: z.string().max(150).trim().optional().or(z.literal("")),
  dateNaissance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format JJ/MM/AAAA attendu")
    .refine((s) => {
      const d = new Date(s);
      return !Number.isNaN(d.getTime()) && d < new Date();
    }, "Date invalide"),
});

export type InscriptionJeuneInput = z.infer<typeof inscriptionJeuneSchema>;

export const inscriptionDEschema = z.object({
  ...baseVisiteur,
  agencePoleEmploi: z.string().max(150).trim().optional().or(z.literal("")),
});

export type InscriptionDEInput = z.infer<typeof inscriptionDEschema>;
