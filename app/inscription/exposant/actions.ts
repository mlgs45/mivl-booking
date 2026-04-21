"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendOtpByEmail } from "@/lib/otp";
import { inscriptionExposantSchema } from "@/lib/validation/exposant";

export type InscriptionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function inscrireExposant(
  _prev: InscriptionState,
  formData: FormData
): Promise<InscriptionState> {
  const parsed = inscriptionExposantSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    raisonSociale: formData.get("raisonSociale"),
    ville: formData.get("ville"),
    codePostal: formData.get("codePostal") ?? "",
    rgpdConsent: formData.get("rgpdConsent"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { ok: false, errors: fieldErrors };
  }

  const { email, prenom, nom, raisonSociale, ville, codePostal } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: {
        email: [
          "Cette adresse email est déjà utilisée. Connectez-vous plutôt.",
        ],
      },
    };
  }

  await db.user.create({
    data: {
      email,
      name: `${prenom} ${nom}`.trim(),
      role: "EXPOSANT",
      exposant: {
        create: {
          raisonSociale,
          secteurs: [],
          ville,
          codePostal: codePostal && codePostal.length > 0 ? codePostal : null,
          description: "",
          statut: "BROUILLON",
        },
      },
    },
  });

  await sendOtpByEmail(email);
  redirect(`/connexion/verifier?email=${encodeURIComponent(email)}`);
}
