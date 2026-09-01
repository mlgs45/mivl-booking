"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { verifierAdminToken } from "@/lib/admin-tokens";
import { motDePasseSchema } from "@/lib/validation/mot-de-passe";

export type DefinirMdpState = {
  ok: boolean;
  error?: string;
};

const schema = z
  .object({
    token: z.string().min(20, "Lien invalide."),
    motDePasse: motDePasseSchema,
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

  // Consommation atomique : on « réclame » le token (usage unique) et on pose
  // le mot de passe dans la même transaction. Deux requêtes concurrentes avec
  // le même lien ne peuvent donc pas aboutir toutes les deux.
  try {
    await db.$transaction(async (tx) => {
      const claim = await tx.adminToken.updateMany({
        where: { id: info.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claim.count === 0) throw new Error("token-deja-consomme");

      await tx.user.update({
        where: { id: info.userId },
        data: { hashedPassword: hashed, emailVerified: new Date() },
      });

      await tx.auditLog.create({
        data: {
          userId: info.userId,
          action: "auth.password_set",
          entite: "User",
          entiteId: info.userId,
        },
      });
    });
  } catch {
    return {
      ok: false,
      error: "Ce lien a déjà été utilisé ou a expiré. Demandez-en un nouveau.",
    };
  }

  const message =
    info.type === "INVITATION" ? "compte-active" : "mot-de-passe-mis-a-jour";
  const isAdmin = info.role === "SUPER_ADMIN" || info.role === "GESTIONNAIRE";
  redirect(`${isAdmin ? "/connexion/admin" : "/connexion"}?ok=${message}`);
}
