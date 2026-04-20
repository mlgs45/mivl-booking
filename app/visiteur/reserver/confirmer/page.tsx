import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { ConfirmerForm } from "./confirmer-form";
import { getVisitorContext } from "../../actions";

export const metadata = { title: "Confirmer mes rendez-vous — MIVL Booking" };

const MAX_RDVS = 6;

export default async function ConfirmerSpeedDatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const ctx = await getVisitorContext();
  if (!ctx) redirect("/visiteur");

  const sp = await searchParams;
  const exposantIds = (sp.sel ?? "").split(",").filter(Boolean);

  if (exposantIds.length === 0) {
    redirect("/visiteur/reserver");
  }

  const existingCount = await db.rendezVous.count({
    where: {
      ...(ctx.type === "JEUNE" ? { jeuneId: ctx.id } : { demandeurEmploiId: ctx.id }),
      statut: { not: "ANNULE" },
      creneau: { type: "SPEED_DATING" },
    },
  });
  if (existingCount + exposantIds.length > MAX_RDVS) {
    redirect("/visiteur/reserver");
  }

  const exposants = await db.exposant.findMany({
    where: { id: { in: exposantIds }, statut: "VALIDE" },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      numStand: true,
      emplacement: true,
      offres: true,
    },
  });

  const ordered = exposantIds
    .map((eid) => exposants.find((e) => e.id === eid))
    .filter((e): e is NonNullable<typeof e> => e != null);

  if (ordered.length !== exposantIds.length) {
    redirect(`/visiteur/reserver?sel=${exposantIds.join(",")}`);
  }

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/visiteur" className="hover:text-primary">Mon espace</Link>
          <span>/</span>
          <Link
            href={`/visiteur/reserver?sel=${exposantIds.join(",")}`}
            className="hover:text-primary"
          >
            Sélection
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Confirmation</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Récapitulatif
          </h1>
          <p className="text-sm text-neutral-700">
            {ordered.length} rendez-vous à confirmer — les horaires seront attribués dans l'ordre optimal.
          </p>
        </div>

        <ol className="space-y-3 mb-6">
          {ordered.map((e, i) => (
            <li
              key={e.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-900 truncate">
                  {e.raisonSociale}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {e.ville}
                  {e.emplacement && ` · ${e.emplacement}`}
                </div>
              </div>
              {e.numStand && (
                <div className="shrink-0 text-xs text-neutral-500">
                  Stand {e.numStand}
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm text-neutral-900 mb-6">
          <strong className="font-semibold">À savoir :</strong>
          <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
            <li>Chaque RDV dure 5 minutes, avec 5 min pour rejoindre le stand suivant.</li>
            <li>Si certains exposants ne sont plus disponibles, les autres seront confirmés.</li>
            <li>Vous pourrez annuler un RDV tant qu'il n'a pas encore eu lieu.</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/visiteur/reserver?sel=${exposantIds.join(",")}`}
            className="flex-1 text-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-semibold py-3 rounded-lg transition-colors"
          >
            ← Modifier
          </Link>
          <div className="flex-1">
            <ConfirmerForm exposantIds={exposantIds} />
          </div>
        </div>
      </main>
    </>
  );
}
