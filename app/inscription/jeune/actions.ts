"use server";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { inscriptionJeuneSchema } from "@/lib/validation/visiteur";

export type InscriptionJeuneState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function inscrireJeune(
  _prev: InscriptionJeuneState,
  formData: FormData,
): Promise<InscriptionJeuneState> {
  const parsed = inscriptionJeuneSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    niveauEtudes: formData.get("niveauEtudes"),
    etablissement: formData.get("etablissement") ?? "",
    dateNaissance: formData.get("dateNaissance"),
    rgpdConsent: formData.get("rgpdConsent"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, errors: fieldErrors };
  }

  const { email, prenom, nom, niveauEtudes, etablissement, dateNaissance } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      errors: { email: ["Cette adresse est déjà utilisée. Connectez-vous plutôt."] },
    };
  }

  await db.user.create({
    data: {
      email,
      name: `${prenom} ${nom}`.trim(),
      role: "JEUNE",
      jeune: {
        create: {
          prenom,
          nom,
          dateNaissance: new Date(dateNaissance),
          niveauEtudes,
          etablissement: etablissement || null,
        },
      },
    },
  });

  await signIn("nodemailer", { email, redirectTo: "/visiteur" });
  return { ok: true };
}
