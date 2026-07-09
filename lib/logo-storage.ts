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
