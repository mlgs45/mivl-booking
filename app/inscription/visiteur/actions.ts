"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { sendEmail } from "@/lib/emails";
import { inscriptionVisiteurSchema } from "@/lib/validation/visiteur";
import { checkInscriptionRateLimit, messageAttente } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export type InscriptionVisiteurState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function inscrireVisiteur(
  _prev: InscriptionVisiteurState,
  formData: FormData,
): Promise<InscriptionVisiteurState> {
  const rate = await checkInscriptionRateLimit(await clientIp());
  if (!rate.allowed) {
    return { ok: false, message: messageAttente(rate.retryAfterSeconds) };
  }

  const parsed = inscriptionVisiteurSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    rgpdConsent: formData.get("rgpdConsent"),
    motDePasse: formData.get("motDePasse"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, errors: fieldErrors };
  }

  const { email, prenom, nom, motDePasse } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return {
      ok: false,
      errors: { email: ["Cette adresse est déjà utilisée. Connectez-vous plutôt."] },
    };
  }
  const existingVisiteur = await db.visiteur.findUnique({ where: { email }, select: { id: true } });
  if (existingVisiteur) {
    return {
      ok: false,
      errors: { email: ["Cette adresse est déjà enregistrée. Connectez-vous plutôt."] },
    };
  }

  const hashedPassword = await hash(motDePasse);

  await db.user.create({
    data: {
      email,
      name: `${prenom} ${nom}`.trim(),
      role: "VISITEUR",
      hashedPassword,
      visiteur: {
        create: { email, prenom, nom },
      },
    },
  });

  try {
    await sendEmail({
      to: email,
      template: "confirmation-inscription-visiteur",
      data: { prenom },
    });
  } catch {
    // Ne jamais bloquer l'inscription si l'envoi email échoue
  }

  try {
    await signIn("credentials", { email, password: motDePasse, redirectTo: "/espace-visiteur" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion?ok=compte-cree");
    }
    throw error;
  }
  return { ok: true };
}
