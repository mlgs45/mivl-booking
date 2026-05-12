import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { OuvertureRdvForm } from "./ouverture-rdv-form";

export const metadata = { title: "Configuration — Admin MIVL" };

export default async function AdminConfigurationPage() {
  const session = await auth();
  if (!session?.user) return null;

  const config = await db.configurationSalon.findUnique({
    where: { id: 1 },
    select: { ouvertureRdvAt: true },
  });

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Configuration</span>
        </div>

        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8">
          Configuration du salon
        </h1>

        <section className="rounded-xl border border-neutral-100 bg-white p-6">
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">
            Ouverture des réservations RDV
          </h2>
          <p className="text-sm text-neutral-600 mb-5">
            Contrôle l'accès aux pages de réservation pour les enseignants, les jeunes et les demandeurs d'emploi. Les inscriptions restent ouvertes indépendamment.
          </p>
          <OuvertureRdvForm ouvertureRdvAt={config?.ouvertureRdvAt ?? null} />
        </section>
      </main>
    </>
  );
}
