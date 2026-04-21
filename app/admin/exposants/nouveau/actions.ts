"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://connect.mivl-orleans.fr";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide."),
  raisonSociale: z.string().trim().min(2, "Raison sociale requise.").max(200),
  ville: z.string().trim().min(2, "Ville requise.").max(120),
  codePostal: z
    .string()
    .trim()
    .regex(/^\d{5}$/u, "Code postal invalide (5 chiffres).")
    .optional()
    .or(z.literal("")),
  siret: z
    .string()
    .trim()
    .regex(/^\d{14}$/u, "SIRET invalide (14 chiffres).")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().min(1, "Description requise.").max(2000),
  estPartenaire: z.string().optional(),
});

export type CreerExposantState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function creerExposant(
  _prev: CreerExposantState,
  formData: FormData,
): Promise<CreerExposantState> {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") {
    return { ok: false, message: "Non autorisé." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    raisonSociale: formData.get("raisonSociale"),
    ville: formData.get("ville"),
    codePostal: formData.get("codePostal") ?? "",
    siret: formData.get("siret") ?? "",
    description: formData.get("description"),
    estPartenaire: formData.get("estPartenaire") ?? undefined,
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

  const { email, raisonSociale, ville, codePostal, siret, description } =
    parsed.data;
  const estPartenaire = parsed.data.estPartenaire === "on";

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: {
        email: ["Un compte existe déjà avec cet email."],
      },
    };
  }

  const created = await db.user.create({
    data: {
      email,
      role: "EXPOSANT",
      exposant: {
        create: {
          raisonSociale,
          ville,
          codePostal: codePostal || null,
          siret: siret || null,
          description,
          secteurs: [],
          estPartenaire,
          statut: "BROUILLON",
        },
      },
    },
    select: { exposant: { select: { id: true } } },
  });

  await db.auditLog.create({
    data: {
      userId: session!.user!.id,
      action: "exposant.cree.admin",
      entite: "Exposant",
      entiteId: created.exposant!.id,
      payload: { estPartenaire },
    },
  });

  try {
    await sendEmail({
      to: email,
      template: "invitation-exposant-admin",
      data: { raisonSociale, appUrl: APP_URL, estPartenaire },
    });
  } catch (error) {
    console.error("[exposant.cree.admin] envoi invitation échoué :", error);
  }

  revalidatePath("/admin/exposants");
  revalidatePath("/exposants");
  redirect(`/admin/exposants/${created.exposant!.id}`);
}
