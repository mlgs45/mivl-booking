import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// STORAGE_DIR pointe sur un volume persistant (cf. docs/deploiement.md).
// Dev : ./uploads — Prod : /app/uploads monté depuis /data/mivl-booking/uploads.
const STORAGE_DIR = process.env.STORAGE_DIR ?? "./uploads";
export const LOGOS_DIR = path.resolve(STORAGE_DIR, "logos");

/**
 * Signatures d'en-tête des formats acceptés.
 *
 * Le `Content-Type` d'une pièce jointe est déclaré par le navigateur, donc par
 * l'appelant : s'y fier seul revient à écrire sur le volume persistant des
 * octets arbitraires sous une extension d'image. On vérifie donc que le contenu
 * correspond bien au type annoncé avant d'enregistrer quoi que ce soit.
 */
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  png: (b) =>
    b.length >= 8 &&
    b.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),
  jpg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) =>
    b.length >= 12 &&
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP",
};

/** Le contenu réel du fichier correspond-il à l'extension retenue ? */
export function contenuEstUneImage(buffer: Buffer, ext: string): boolean {
  const verifie = SIGNATURES[ext];
  return verifie ? verifie(buffer) : false;
}

export const MESSAGE_CONTENU_INVALIDE =
  "Ce fichier n'est pas une image valide. Enregistrez-le au format PNG, JPG ou WEBP et réessayez.";

export async function removeLogoFileIfExists(urlRelative: string | null) {
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
