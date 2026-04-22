"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import {
  consommerAdminToken,
  verifierAdminToken,
} from "@/lib/admin-tokens";

export type DefinirMdpState = {
  ok: boolean;
  error?: string;
};

const schema = z
  .object({
    token: z.string().min(20, "Lien invalide."),
    motDePasse: z
      .string()
      .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
      .max(200, "Mot de passe trop long."),
    confirmation: z.string(),
  })
  .refine((v) => v.motDePasse === v.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

export async function definirMotDePasse(
  _prev: DefinirMdpState,
  formData: FormData,
): Promise<DefinirMdpState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    motDePasse: formData.get("motDePasse"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  const info = await verifierAdminToken(parsed.data.token);
  if (!info) {
    return {
      ok: false,
      error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
    };
  }

  const hashed = await hash(parsed.data.motDePasse);

  await db.user.update({
    where: { id: info.userId },
    data: {
      hashedPassword: hashed,
      emailVerified: new Date(),
    },
  });

  await consommerAdminToken(info.id);

  const message =
    info.type === "INVITATION"
      ? "compte-active"
      : "mot-de-passe-mis-a-jour";
  redirect(`/connexion/admin?ok=${message}`);
}
