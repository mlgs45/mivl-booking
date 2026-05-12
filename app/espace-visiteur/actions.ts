"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getVisiteurId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "VISITEUR") return null;
  const v = await db.visiteur.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return v?.id ?? null;
}

export async function toggleFavori(exposantId: string): Promise<void> {
  const visiteurId = await getVisiteurId();
  if (!visiteurId) return;

  const visiteur = await db.visiteur.findUnique({
    where: { id: visiteurId },
    select: { exposantsFavoris: true },
  });
  if (!visiteur) return;

  const isFavori = visiteur.exposantsFavoris.includes(exposantId);
  const next = isFavori
    ? visiteur.exposantsFavoris.filter((id) => id !== exposantId)
    : [...visiteur.exposantsFavoris, exposantId];

  await db.visiteur.update({
    where: { id: visiteurId },
    data: { exposantsFavoris: next },
  });

  revalidatePath("/espace-visiteur");
  revalidatePath("/espace-visiteur/programme");
}
