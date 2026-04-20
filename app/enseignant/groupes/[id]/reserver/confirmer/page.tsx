import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addMinutes } from "date-fns";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { ConfirmerForm } from "./confirmer-form";

export const metadata = { title: "Confirmer le parcours — MIVL Booking" };

const SLOT_DURATION_MIN = 30;

export default async function ConfirmerParcoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sel?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  const { id } = await params;
  const sp = await searchParams;
  const exposantIds = (sp.sel ?? "").split(",").filter(Boolean);

  if (exposantIds.length !== 4) {
    redirect(`/enseignant/groupes/${id}/reserver`);
  }

  const groupe = await db.groupe.findUnique({
    where: { id },
    include: {
      enseignant: { select: { userId: true } },
      rendezVous: { where: { statut: { not: "ANNULE" } }, select: { id: true } },
    },
  });
  if (!groupe) notFound();
  if (groupe.enseignant.userId !== session.user.id) redirect("/enseignant");
  if (groupe.rendezVous.length > 0) redirect(`/enseignant/groupes/${id}`);
  if (!groupe.creneauArrivee) redirect(`/enseignant/groupes/${id}`);

  const exposants = await db.exposant.findMany({
    where: { id: { in: exposantIds }, statut: "VALIDE" },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      numStand: true,
      emplacement: true,
    },
  });

  const ordered = exposantIds
    .map((eid) => exposants.find((e) => e.id === eid))
    .filter((e): e is NonNullable<typeof e> => e != null);

  if (ordered.length !== 4) {
    redirect(`/enseignant/groupes/${id}/reserver?sel=${exposantIds.join(",")}`);
  }

  const [h, m] = groupe.creneauArrivee.split(":").map(Number);
  const baseDate = new Date();
  baseDate.setUTCHours(h ?? 0, m ?? 0, 0, 0);

  const RDV_MIN = 20;
  const fmt = (d: Date) =>
    `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;

  const slots = Array.from({ length: 4 }, (_, i) => {
    const debut = addMinutes(baseDate, i * SLOT_DURATION_MIN);
    const fin = addMinutes(debut, RDV_MIN);
    const transitionFin = addMinutes(debut, SLOT_DURATION_MIN);
    return { debut: fmt(debut), fin: fmt(fin), transitionFin: fmt(transitionFin) };
  });

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
          <Link
            href={`/enseignant/groupes/${id}/reserver?sel=${exposantIds.join(",")}`}
            className="hover:text-primary"
          >
            Sélection
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Confirmation</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Récapitulatif du parcours
          </h1>
          <p className="text-sm text-neutral-700">
            Groupe <strong>{groupe.nom}</strong> — arrivée {groupe.creneauArrivee} le 15 octobre 2026
          </p>
        </div>

        <ol className="space-y-2 mb-6">
          {ordered.map((e, i) => {
            const slot = slots[i]!;
            const isLast = i === ordered.length - 1;
            return (
              <li key={e.id} className="space-y-2">
                <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4">
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
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {slot.debut} – {slot.fin}
                    </div>
                    {e.numStand && (
                      <div className="text-xs text-neutral-500">Stand {e.numStand}</div>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-2.5">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 text-sm flex items-center justify-center">
                      ⇣
                    </span>
                    <div className="flex-1 text-sm text-neutral-500">
                      Déplacement au stand suivant
                    </div>
                    <div className="shrink-0 text-right text-xs text-neutral-500">
                      {slot.fin} – {slot.transitionFin} · 10 min
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm text-neutral-900 mb-6">
          <strong className="font-semibold">À savoir :</strong>
          <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
            <li>Chaque rendez-vous dure 20 minutes, puis 10 min pour rejoindre le stand suivant.</li>
            <li>Si un exposant n'a plus de créneau, vous pourrez en choisir un autre.</li>
            <li>Vous pouvez annuler et refaire un parcours tant que nous ne sommes pas trop proche de la date.</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/enseignant/groupes/${id}/reserver?sel=${exposantIds.join(",")}`}
            className="flex-1 text-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-semibold py-3 rounded-lg transition-colors"
          >
            ← Modifier
          </Link>
          <div className="flex-1">
            <ConfirmerForm groupeId={groupe.id} exposantIds={exposantIds} />
          </div>
        </div>
      </main>
    </>
  );
}
