"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, signIn } from "@/auth";
import { homePathForRole } from "@/lib/auth-redirect";
import { sendOtpByEmail } from "@/lib/otp";
import { checkOtpSendRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export type VerifierOtpState = {
  ok: boolean;
  error?: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/, "Code invalide (6 chiffres attendus)."),
});

export async function verifierOtp(
  _prev: VerifierOtpState,
  formData: FormData,
): Promise<VerifierOtpState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Code invalide.",
    };
  }

  try {
    await signIn("otp", {
      email: parsed.data.email,
      code: parsed.data.code,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: "Code invalide ou expiré. Demandez un nouveau code si besoin.",
      };
    }
    throw error;
  }

  const session = await auth();
  if (!session?.user?.role) {
    return {
      ok: false,
      error: "Une erreur s'est produite. Réessayez.",
    };
  }

  redirect(homePathForRole(session.user.role));
}

export type RenvoyerOtpState = {
  ok: boolean;
  message?: string;
  error?: string;
};

const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function renvoyerOtp(
  _prev: RenvoyerOtpState,
  formData: FormData,
): Promise<RenvoyerOtpState> {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Adresse email invalide." };
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
  if (user && user.role !== "SUPER_ADMIN" && user.role !== "GESTIONNAIRE") {
    await sendOtpByEmail(email);
  }

  return { ok: true, message: "Un nouveau code vient d'être envoyé." };
}
