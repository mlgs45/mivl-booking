import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { ScanStandClient } from "./scan-client";

export const metadata = { title: "Scan stand — MIVL Connect" };

export default async function ExposantScanPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "EXPOSANT") redirect("/");

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    select: { statut: true, raisonSociale: true, numStand: true },
  });
  if (!exposant || exposant.statut !== "VALIDE") redirect("/exposant");

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/exposant" className="hover:text-primary">
            Exposant
          </Link>
          <span>/</span>
          <Link href="/exposant/rdv" className="hover:text-primary">
            Rendez-vous
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Scan</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 mb-1">
          Scan des visiteurs
        </h1>
        <p className="text-sm text-neutral-700 mb-6">
          {exposant.raisonSociale}
          {exposant.numStand && <> · Stand {exposant.numStand}</>}
        </p>

        <ScanStandClient />
      </main>
    </>
  );
}
