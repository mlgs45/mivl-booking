"use server";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  MAX_LOGO_BYTES,
  ACCEPTED_LOGO_TYPES,
  LOGOS_DIR,
  removeLogoFileIfExists,
  contenuEstUneImage,
  MESSAGE_CONTENU_INVALIDE,
} from "@/lib/logo-storage";

export type LogoState = {
  ok: boolean;
  message?: string;
};

async function getAdminSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") return null;
  return session;
}

/** Téléversement/remplacement du logo par un admin — aucune restriction de statut. */
export async function televerserLogoAdmin(
  _prev: LogoState,
  formData: FormData,
): Promise<LogoState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposantId = formData.get("exposantId");
  if (typeof exposantId !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id: exposantId },
    select: { id: true, logoUrl: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Sélectionnez un fichier." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, message: "Fichier trop volumineux (max 2 Mo)." };
  }
  const ext = ACCEPTED_LOGO_TYPES[file.type];
  if (!ext) {
    return { ok: false, message: "Format non supporté (PNG, JPG, WEBP)." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Le type déclaré par le navigateur ne suffit pas : on vérifie les octets.
  if (!contenuEstUneImage(buffer, ext)) {
    return { ok: false, message: MESSAGE_CONTENU_INVALIDE };
  }

  const filename = `${exposant.id}.${ext}`;
  const logoUrl = `/api/logos/${filename}`;

  try {
    await mkdir(LOGOS_DIR, { recursive: true });
    await removeLogoFileIfExists(exposant.logoUrl);
    await writeFile(path.join(LOGOS_DIR, filename), buffer);
    await db.exposant.update({
      where: { id: exposant.id },
      data: { logoUrl },
    });
  } catch (error) {
    console.error("[admin logo] échec de l'enregistrement :", error);
    return {
      ok: false,
      message: "Erreur serveur, le logo n'a pas pu être enregistré.",
    };
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.logo.modifie_admin",
      entite: "Exposant",
      entiteId: exposant.id,
    },
  });

  revalidatePath(`/admin/exposants/${exposant.id}`);
  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
  revalidatePath("/exposants");
  return { ok: true, message: "Logo téléversé." };
}

/** Suppression du logo par un admin — aucune restriction de statut. */
export async function supprimerLogoAdmin(
  _prev: LogoState,
  formData: FormData,
): Promise<LogoState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const exposantId = formData.get("exposantId");
  if (typeof exposantId !== "string") return { ok: false, message: "ID manquant." };

  const exposant = await db.exposant.findUnique({
    where: { id: exposantId },
    select: { id: true, logoUrl: true },
  });
  if (!exposant) return { ok: false, message: "Exposant introuvable." };

  try {
    await removeLogoFileIfExists(exposant.logoUrl);
    await db.exposant.update({
      where: { id: exposant.id },
      data: { logoUrl: null },
    });
  } catch (error) {
    console.error("[admin logo] échec de la suppression :", error);
    return {
      ok: false,
      message: "Erreur serveur, le logo n'a pas pu être supprimé.",
    };
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "exposant.logo.supprime_admin",
      entite: "Exposant",
      entiteId: exposant.id,
    },
  });

  revalidatePath(`/admin/exposants/${exposant.id}`);
  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
  revalidatePath("/exposants");
  return { ok: true, message: "Logo supprimé." };
}
