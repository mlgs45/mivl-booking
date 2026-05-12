"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";
import { inscriptionVisiteurSchema } from "@/lib/validation/visiteur";

export type InscriptionVisiteurState = {
  ok: boolean;
  errors?: Record<string, string[]>;
};

export async function inscrireVisiteur(
  _prev: InscriptionVisiteurState,
  formData: FormData,
): Promise<InscriptionVisiteurState> {
  const parsed = inscriptionVisiteurSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
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

  const { email, prenom, nom } = parsed.data;

  const existing = await db.visiteur.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      errors: { email: ["Cette adresse est déjà enregistrée."] },
    };
  }

  await db.visiteur.create({ data: { email, prenom, nom } });

  try {
    await sendEmail({ to: email, template: "confirmation-inscription-visiteur", data: { prenom } });
  } catch {
    // Ne jamais bloquer l'inscription si l'envoi email échoue
  }

  return { ok: true };
}
