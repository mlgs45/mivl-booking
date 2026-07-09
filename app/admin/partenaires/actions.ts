"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { creerAdminToken } from "@/lib/admin-tokens";
import { sendEmail } from "@/lib/emails";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://connect.mivl-orleans.fr";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/connexion/admin");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") redirect("/admin");
  return session;
}

// ─── Création d'un nouveau partenaire ───────────────────────────────────────

export type CreerPartenaireState = {
  ok: boolean;
  error?: string;
  message?: string;
};

const creerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  prenom: z.string().trim().min(2, "Prénom trop court.").max(60),
  nom: z.string().trim().min(2, "Nom trop court.").max(60),
});

export async function creerPartenaire(
  _prev: CreerPartenaireState,
  formData: FormData,
): Promise<CreerPartenaireState> {
  const session = await requireAdmin();

  const parsed = creerSchema.safeParse({
    email: formData.get("email"),
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  const { email, prenom, nom: nomFamille } = parsed.data;
  const nom = `${prenom} ${nomFamille}`;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing) {
    return {
      ok: false,
      error: `Un compte existe déjà avec cette adresse (rôle actuel : ${existing.role}).`,
    };
  }

  const user = await db.user.create({
    data: {
      email,
      name: nom,
      role: "PARTENAIRE",
      emailVerified: null,
      hashedPassword: null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "partenaire.cree",
      entite: "User",
      entiteId: user.id,
    },
  });

  const token = await creerAdminToken({
    userId: user.id,
    type: "INVITATION",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: email,
    template: "invitation-partenaire",
    data: {
      nomInvite: nom,
      lienActivation: `${APP_URL}/definir-mot-de-passe?token=${token}`,
      invitePar: session.user.name ?? "La CCI Centre-Val de Loire",
    },
  });

  revalidatePath("/admin/partenaires");
  redirect("/admin/partenaires?ok=invitation-envoyee");
}

// ─── Renvoyer l'invitation ──────────────────────────────────────────────────

export async function renvoyerInvitationPartenaire(userId: string) {
  const session = await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true, hashedPassword: true },
  });
  if (!user) redirect("/admin/partenaires?erreur=introuvable");
  if (user.role !== "PARTENAIRE") redirect("/admin/partenaires?erreur=pas-partenaire");
  if (user.hashedPassword) redirect("/admin/partenaires?erreur=deja-active");

  const token = await creerAdminToken({
    userId,
    type: "INVITATION",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: user.email,
    template: "invitation-partenaire",
    data: {
      nomInvite: user.name ?? user.email,
      lienActivation: `${APP_URL}/definir-mot-de-passe?token=${token}`,
      invitePar: session.user.name ?? "La CCI Centre-Val de Loire",
    },
  });

  revalidatePath("/admin/partenaires");
  redirect("/admin/partenaires?ok=invitation-renvoyee");
}

// ─── Déclencher un reset de mot de passe ────────────────────────────────────

export async function declencherResetPartenaire(userId: string) {
  const session = await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true },
  });
  if (!user) redirect("/admin/partenaires?erreur=introuvable");
  if (user.role !== "PARTENAIRE") redirect("/admin/partenaires?erreur=pas-partenaire");

  const token = await creerAdminToken({
    userId,
    type: "RESET",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: user.email,
    template: "reset-mdp-partenaire",
    data: {
      nomUtilisateur: user.name ?? user.email,
      lienReset: `${APP_URL}/definir-mot-de-passe?token=${token}`,
    },
  });

  revalidatePath("/admin/partenaires");
  redirect("/admin/partenaires?ok=reset-envoye");
}

// ─── Supprimer un partenaire ─────────────────────────────────────────────────

export async function supprimerPartenaire(userId: string) {
  const session = await requireAdmin();

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) redirect("/admin/partenaires?erreur=introuvable");
  if (target.role !== "PARTENAIRE") redirect("/admin/partenaires?erreur=pas-partenaire");

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "partenaire.supprime",
      entite: "User",
      entiteId: userId,
    },
  });

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin/partenaires");
  redirect("/admin/partenaires?ok=supprime");
}
