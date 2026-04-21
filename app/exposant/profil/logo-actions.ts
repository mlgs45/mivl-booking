"use server";

import { writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type LogoState = {
  ok: boolean;
  message?: string;
};

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// STORAGE_DIR pointe sur un volume persistant (cf. docs/deploiement.md).
// Dev : ./uploads — Prod : /app/uploads monté depuis /data/mivl-booking/uploads.
const STORAGE_DIR = process.env.STORAGE_DIR ?? "./uploads";
const LOGOS_DIR = path.resolve(STORAGE_DIR, "logos");

async function getCurrentExposant() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, statut: true, logoUrl: true },
  });
}

async function removeFileIfExists(urlRelative: string | null) {
  if (!urlRelative) return;
  const filename = urlRelative.split("/").pop();
  if (!filename) return;
  const abs = path.join(LOGOS_DIR, filename);
  if (existsSync(abs)) {
    try {
      await unlink(abs);
    } catch (error) {
      console.error("[logo] suppression ancien fichier échouée :", error);
    }
  }
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
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Fichier trop volumineux (max 2 Mo)." };
  }
  const ext = ACCEPTED[file.type];
  if (!ext) {
    return { ok: false, message: "Format non supporté (PNG, JPG, WEBP)." };
  }

  await mkdir(LOGOS_DIR, { recursive: true });
  await removeFileIfExists(exposant.logoUrl);

  const filename = `${exposant.id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOGOS_DIR, filename), buffer);

  const logoUrl = `/api/logos/${filename}`;
  await db.exposant.update({
    where: { id: exposant.id },
    data: { logoUrl },
  });

  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
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

  await removeFileIfExists(exposant.logoUrl);
  await db.exposant.update({
    where: { id: exposant.id },
    data: { logoUrl: null },
  });

  revalidatePath("/exposant/profil");
  revalidatePath("/exposant");
  revalidatePath(`/exposants/${exposant.id}`);
  return { ok: true, message: "Logo supprimé." };
}
