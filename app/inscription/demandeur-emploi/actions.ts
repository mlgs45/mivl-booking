"use server";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { inscriptionDEschema } from "@/lib/validation/visiteur";

export type InscriptionDEState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function inscrireDemandeurEmploi(
  _prev: InscriptionDEState,
  formData: FormData,
): Promise<InscriptionDEState> {
  const parsed = inscriptionDEschema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    agencePoleEmploi: formData.get("agencePoleEmploi") ?? "",
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

  const { email, prenom, nom, agencePoleEmploi } = parsed.data;

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
      role: "DEMANDEUR_EMPLOI",
      demandeurEmploi: {
        create: {
          prenom,
          nom,
          agencePoleEmploi: agencePoleEmploi || null,
        },
      },
    },
  });

  await signIn("nodemailer", { email, redirectTo: "/visiteur" });
  return { ok: true };
}
