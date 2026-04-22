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

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/connexion/admin");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  return session;
}

// ─── Création d'un nouvel administrateur ────────────────────────────────────

export type CreerAdminState = {
  ok: boolean;
  error?: string;
  message?: string;
};

const creerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  nom: z.string().trim().min(2, "Nom trop court.").max(120),
  role: z.enum(["SUPER_ADMIN", "GESTIONNAIRE"]),
});

export async function creerAdmin(
  _prev: CreerAdminState,
  formData: FormData,
): Promise<CreerAdminState> {
  const session = await requireSuperAdmin();

  const parsed = creerSchema.safeParse({
    email: formData.get("email"),
    nom: formData.get("nom"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  const { email, nom, role } = parsed.data;

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
      role,
      emailVerified: null,
      hashedPassword: null,
    },
  });

  const token = await creerAdminToken({
    userId: user.id,
    type: "INVITATION",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: email,
    template: "invitation-admin",
    data: {
      nomInvite: nom,
      role,
      lienActivation: `${APP_URL}/definir-mot-de-passe?token=${token}`,
      invitePar: session.user.name ?? "Un super administrateur",
    },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?ok=invitation-envoyee");
}

// ─── Renvoyer l'invitation ──────────────────────────────────────────────────

export async function renvoyerInvitation(userId: string) {
  const session = await requireSuperAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true, hashedPassword: true },
  });
  if (!user) redirect("/admin/utilisateurs?erreur=introuvable");
  if (user.hashedPassword) {
    redirect("/admin/utilisateurs?erreur=deja-active");
  }
  if (user.role !== "SUPER_ADMIN" && user.role !== "GESTIONNAIRE") {
    redirect("/admin/utilisateurs?erreur=pas-admin");
  }

  const token = await creerAdminToken({
    userId,
    type: "INVITATION",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: user.email,
    template: "invitation-admin",
    data: {
      nomInvite: user.name ?? user.email,
      role: user.role,
      lienActivation: `${APP_URL}/definir-mot-de-passe?token=${token}`,
      invitePar: session.user.name ?? "Un super administrateur",
    },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?ok=invitation-renvoyee");
}

// ─── Déclencher un reset de mot de passe ────────────────────────────────────

export async function declencherReset(userId: string) {
  const session = await requireSuperAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true },
  });
  if (!user) redirect("/admin/utilisateurs?erreur=introuvable");
  if (user.role !== "SUPER_ADMIN" && user.role !== "GESTIONNAIRE") {
    redirect("/admin/utilisateurs?erreur=pas-admin");
  }

  const token = await creerAdminToken({
    userId,
    type: "RESET",
    creeParId: session.user.id,
  });

  await sendEmail({
    to: user.email,
    template: "reset-mdp-admin",
    data: {
      nomUtilisateur: user.name ?? user.email,
      lienReset: `${APP_URL}/definir-mot-de-passe?token=${token}`,
    },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?ok=reset-envoye");
}

// ─── Changer le rôle d'un admin ─────────────────────────────────────────────

export async function changerRole(userId: string, nouveauRole: string) {
  const session = await requireSuperAdmin();

  if (nouveauRole !== "SUPER_ADMIN" && nouveauRole !== "GESTIONNAIRE") {
    redirect("/admin/utilisateurs?erreur=role-invalide");
  }
  if (userId === session.user.id) {
    redirect("/admin/utilisateurs?erreur=pas-soi-meme");
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) redirect("/admin/utilisateurs?erreur=introuvable");
  if (target.role !== "SUPER_ADMIN" && target.role !== "GESTIONNAIRE") {
    redirect("/admin/utilisateurs?erreur=pas-admin");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: nouveauRole as "SUPER_ADMIN" | "GESTIONNAIRE" },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?ok=role-change");
}

// ─── Supprimer un admin ─────────────────────────────────────────────────────

export async function supprimerAdmin(userId: string) {
  const session = await requireSuperAdmin();

  if (userId === session.user.id) {
    redirect("/admin/utilisateurs?erreur=pas-soi-meme");
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) redirect("/admin/utilisateurs?erreur=introuvable");
  if (target.role !== "SUPER_ADMIN" && target.role !== "GESTIONNAIRE") {
    redirect("/admin/utilisateurs?erreur=pas-admin");
  }

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?ok=supprime");
}
