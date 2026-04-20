import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function EnseignantGroupesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ENSEIGNANT") redirect("/");

  const enseignant = await db.enseignant.findUnique({
    where: { userId: session.user.id },
    select: { statut: true },
  });
  if (!enseignant || enseignant.statut !== "VALIDE") redirect("/enseignant");

  return children;
}
