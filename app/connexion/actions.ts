"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOtpByEmail } from "@/lib/otp";
import { checkOtpSendRateLimit } from "@/lib/rate-limit";

export type DemanderOtpState = {
  ok: boolean;
  error?: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

export async function demanderOtp(
  _prev: DemanderOtpState,
  formData: FormData,
): Promise<DemanderOtpState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Adresse email invalide.",
    };
  }

  const { email } = parsed.data;

  const rate = await checkOtpSendRateLimit(email);
  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Trop de demandes récentes. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (!user) {
    return {
      ok: false,
      error:
        "Aucun compte n'est associé à cette adresse. Inscrivez-vous d'abord depuis la page d'accueil.",
    };
  }

  if (user.role === "SUPER_ADMIN" || user.role === "GESTIONNAIRE") {
    return {
      ok: false,
      error:
        "Les administrateurs se connectent via /connexion/admin avec leur mot de passe.",
    };
  }

  await sendOtpByEmail(email);
  redirect(`/connexion/verifier?email=${encodeURIComponent(email)}`);
}
