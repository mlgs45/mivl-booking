"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
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
    motDePasse: formData.get("motDePasse"),
    confirmation: formData.get("confirmation"),
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

  const { email, prenom, nom, raisonSociale, ville, codePostal, motDePasse } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: {
        email: ["Cette adresse email est déjà utilisée. Connectez-vous plutôt."],
      },
    };
  }

  const hashedPassword = await hash(motDePasse);

  await db.user.create({
    data: {
      email,
      name: `${prenom} ${nom}`.trim(),
      role: "EXPOSANT",
      hashedPassword,
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

  try {
    await signIn("credentials", { email, password: motDePasse, redirectTo: "/exposant" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion?ok=compte-cree");
    }
    throw error;
  }
  return { ok: true };
}
