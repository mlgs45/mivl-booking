import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { GroupeEditForm } from "./groupe-edit-form";

export const metadata = { title: "Modifier le groupe — MIVL Booking" };

export default async function ModifierGroupePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  const { id } = await params;

  const groupe = await db.groupe.findUnique({
    where: { id },
    include: {
      enseignant: { select: { userId: true } },
      rendezVous: {
        where: { statut: { not: "ANNULE" } },
        select: { id: true },
      },
    },
  });

  if (!groupe) notFound();
  if (groupe.enseignant.userId !== session.user.id) redirect("/enseignant");

  const parcoursActif = groupe.rendezVous.length > 0;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/enseignant" className="hover:text-primary">Mes groupes</Link>
          <span>/</span>
          <Link href={`/enseignant/groupes/${id}`} className="hover:text-primary">
            {groupe.nom}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Modifier</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Modifier le groupe
          </h1>
          <p className="text-sm text-neutral-700">
            {parcoursActif
              ? "Le parcours est confirmé : vous pouvez ajuster la composition du groupe mais plus son heure d'arrivée."
              : "Vous pouvez modifier librement les informations tant que le parcours n'est pas confirmé."}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-6 sm:p-8">
          <GroupeEditForm
            groupeId={groupe.id}
            parcoursActif={parcoursActif}
            defaultValues={{
              nom: groupe.nom,
              niveau: groupe.niveau,
              tailleEffective: groupe.tailleEffective,
              prenomsEleves: groupe.prenomsEleves,
              creneauArrivee: groupe.creneauArrivee,
            }}
          />
        </div>
      </main>
    </>
  );
}
