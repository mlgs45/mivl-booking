import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const STORAGE_DIR = process.env.STORAGE_DIR ?? "./uploads";
const LOGOS_DIR = path.resolve(STORAGE_DIR, "logos");

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // Empêche ../ et chemins absolus : on ne sert qu'un fichier à plat.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return new NextResponse("Nom de fichier invalide", { status: 400 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new NextResponse("Type non supporté", { status: 400 });
  }

  try {
    const buffer = await readFile(path.join(LOGOS_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Logo introuvable", { status: 404 });
  }
}
