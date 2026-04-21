"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendOtpByEmail } from "@/lib/otp";
import { inscriptionEnseignantSchema } from "@/lib/validation/enseignant";
import { sendEmail } from "@/lib/emails";

export type InscriptionEnseignantState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function inscrireEnseignant(
  _prev: InscriptionEnseignantState,
  formData: FormData,
): Promise<InscriptionEnseignantState> {
  const parsed = inscriptionEnseignantSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    etablissement: formData.get("etablissement"),
    ville: formData.get("ville"),
    matiere: formData.get("matiere") ?? "",
    niveau: formData.get("niveau") || undefined,
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

  const { email, prenom, nom, etablissement, ville, matiere, niveau } = parsed.data;

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
      role: "ENSEIGNANT",
      enseignant: {
        create: {
          prenom,
          nom,
          etablissement,
          ville,
          matiere: matiere || null,
          niveau: niveau ?? null,
        },
      },
    },
  });

  await sendEmail({
    to: email,
    template: "confirmation-inscription-enseignant",
    data: { prenom, etablissement },
  });

  await sendOtpByEmail(email);
  redirect(`/connexion/verifier?email=${encodeURIComponent(email)}`);
}
