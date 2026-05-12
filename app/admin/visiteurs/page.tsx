import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { SupprimerBouton } from "./supprimer-bouton";

export const metadata = { title: "Visiteurs — Admin MIVL" };

export default async function AdminVistieursPage({
  searchParams,
}: {
  searchParams: Promise<{ supprime?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const params = await searchParams;

  const visiteurs = await db.visiteur.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-neutral-700 mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Visiteurs</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Visiteurs
            <span className="ml-3 text-lg font-normal text-neutral-500">{visiteurs.length}</span>
          </h1>
        </div>

        {params.supprime && (
          <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-700 p-3 text-sm">
            Visiteur <strong>{params.supprime}</strong> supprimé définitivement.
          </div>
        )}

        {visiteurs.length === 0 ? (
          <div className="text-center py-20 text-neutral-700">Aucun visiteur inscrit pour l'instant.</div>
        ) : (
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden lg:table-cell">Inscrit le</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visiteurs.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{v.prenom} {v.nom}</div>
                      <div className="text-xs text-neutral-500 sm:hidden">{v.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 hidden sm:table-cell">{v.email}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                      {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SupprimerBouton visiteurId={v.id} nom={`${v.prenom} ${v.nom}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
