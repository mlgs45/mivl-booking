"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { creerAdminToken } from "@/lib/admin-tokens";
import { sendEmail } from "@/lib/emails";
import { checkOtpSendRateLimit } from "@/lib/rate-limit";

export type ResetMdpState = {
  ok: boolean;
  message?: string;
  error?: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://connect.mivl-orleans.fr";

export async function demanderResetMdp(
  _prev: ResetMdpState,
  formData: FormData,
): Promise<ResetMdpState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Adresse email invalide.",
    };
  }

  const { email } = parsed.data;

  const rate = await checkOtpSendRateLimit(`reset:${email}`);
  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Trop de demandes récentes. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    return {
      ok: false,
      error:
        "Aucun compte administrateur n'est associé à cette adresse. Contactez un super administrateur.",
    };
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "GESTIONNAIRE") {
    return {
      ok: false,
      error:
        "Cette adresse n'est pas un compte administrateur. Les visiteurs se connectent via /connexion avec un code email à 6 chiffres.",
    };
  }

  const token = await creerAdminToken({
    userId: user.id,
    type: "RESET",
  });

  const lienReset = `${APP_URL}/definir-mot-de-passe?token=${token}`;

  await sendEmail({
    to: email,
    template: "reset-mdp-admin",
    data: {
      nomUtilisateur: user.name ?? email,
      lienReset,
    },
  });

  return {
    ok: true,
    message:
      "Un email contenant un lien de réinitialisation vient de vous être envoyé. Le lien est valable 7 jours.",
  };
}
