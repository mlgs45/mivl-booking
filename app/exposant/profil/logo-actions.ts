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

async function getCurrentExposant() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true, logoUrl: true },
  });
}

export async function televerserLogo(
  _prev: LogoState,
  formData: FormData,
): Promise<LogoState> {
  const exposant = await getCurrentExposant();
  if (!exposant) return { ok: false, message: "Session expirée." };
  if (exposant.statut === "SOUMIS") {
    return { ok: false, message: "Fiche en cours de validation, logo non modifiable." };
  }

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
    console.error("[logo] échec de l'enregistrement :", error);
    return {
      ok: false,
      message: "Erreur serveur, le logo n'a pas pu être enregistré. Réessayez ou contactez la CCI.",
    };
  }

  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
  revalidatePath("/exposants");
  return { ok: true, message: "Logo téléversé." };
}

export async function supprimerLogo(
  _prev: LogoState,
  _formData: FormData,
): Promise<LogoState> {
  const exposant = await getCurrentExposant();
  if (!exposant) return { ok: false, message: "Session expirée." };
  if (exposant.statut === "SOUMIS") {
    return { ok: false, message: "Fiche en cours de validation, logo non modifiable." };
  }

  try {
    await removeLogoFileIfExists(exposant.logoUrl);
    await db.exposant.update({
      where: { id: exposant.id },
      data: { logoUrl: null },
    });
  } catch (error) {
    console.error("[logo] échec de la suppression :", error);
    return {
      ok: false,
      message: "Erreur serveur, le logo n'a pas pu être supprimé. Réessayez ou contactez la CCI.",
    };
  }

  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
  revalidatePath("/exposants");
  return { ok: true, message: "Logo supprimé." };
}
