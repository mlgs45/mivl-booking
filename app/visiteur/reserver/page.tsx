import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { BookingFilterBar } from "@/components/booking/filter-bar";
import { ExposantCard } from "@/components/booking/exposant-card";
import { SelectionBar } from "@/components/booking/selection-bar";
import { SECTEUR_CODES } from "@/lib/referentiel/secteurs";
import { getVisitorContext } from "../actions";
import type { TypeOffre } from "@prisma/client";

export const metadata = { title: "Choisir mes exposants — MIVL Connect" };

const OFFRES_POSSIBLES: TypeOffre[] = [
  "DECOUVERTE_ENTREPRISE",
  "DECOUVERTE_METIERS",
  "OPPORTUNITES",
];

const MAX_RDVS = 6;

function parseSelection(raw: string | undefined, max: number): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean).slice(0, max);
}

function buildHref(
  base: string,
  searchParams: Record<string, string | undefined>,
  patch: Record<string, string | undefined>,
): string {
  const merged = { ...searchParams, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

export default async function ReserverSpeedDatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; secteur?: string; offre?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const ctx = await getVisitorContext();
  if (!ctx) redirect("/visiteur");

  const sp = await searchParams;

  const existingCount = await db.rendezVous.count({
    where: {
      ...(ctx.type === "JEUNE" ? { jeuneId: ctx.id } : { demandeurEmploiId: ctx.id }),
      statut: { not: "ANNULE" },
      creneau: { type: "SPEED_DATING" },
    },
  });
  const availableSlots = Math.max(0, MAX_RDVS - existingCount);

  if (availableSlots === 0) {
    redirect("/visiteur");
  }

  const selection = parseSelection(sp.sel, availableSlots);

  const exposants = await db.exposant.findMany({
    where: {
      statut: "VALIDE",
      ...(sp.secteur ? { secteurs: { has: sp.secteur } } : {}),
      ...(sp.offre ? { offres: { has: sp.offre as TypeOffre } } : {}),
    },
    select: {
      id: true,
      raisonSociale: true,
      ville: true,
      secteurs: true,
      description: true,
      offres: true,
      innovationMiseEnAvant: true,
      descriptionInnovation: true,
      numStand: true,
    },
    orderBy: { raisonSociale: "asc" },
  });

  const baseHref = "/visiteur/reserver";
  const selected = new Set(selection);
  const full = selection.length >= availableSlots;

  const hrefFor = (patch: Record<string, string | undefined>) =>
    buildHref(baseHref, sp, patch);

  const toggleHref = (exposantId: string) => {
    const next = selected.has(exposantId)
      ? selection.filter((s) => s !== exposantId)
      : [...selection, exposantId];
    return hrefFor({ sel: next.length > 0 ? next.join(",") : undefined });
  };

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/visiteur" className="hover:text-primary">Mon espace</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Choisir mes exposants</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            {existingCount > 0
              ? `Ajouter jusqu'à ${availableSlots} RDV`
              : "Choisissez jusqu'à 6 rendez-vous"}
          </h1>
          <p className="text-sm text-neutral-700">
            Chaque speed dating dure 5 minutes. Nous calculerons automatiquement les créneaux compatibles dans l'après-midi.
          </p>
        </div>

        <BookingFilterBar
          baseHref={baseHref}
          searchParams={sp}
          secteurs={[...SECTEUR_CODES]}
          offres={OFFRES_POSSIBLES}
          selectedSecteur={sp.secteur}
          selectedOffre={sp.offre}
        />

        {exposants.length === 0 ? (
          <div className="text-center py-20 text-neutral-700">
            <p>Aucun exposant ne correspond à ces filtres.</p>
            <Link href={baseHref} className="text-primary hover:underline mt-2 inline-block">
              Réinitialiser les filtres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exposants.map((e) => {
              const isSel = selected.has(e.id);
              const idx = isSel ? selection.indexOf(e.id) : undefined;
              return (
                <ExposantCard
                  key={e.id}
                  exposant={e}
                  toggleHref={toggleHref(e.id)}
                  selected={isSel}
                  selectionIndex={idx}
                  disabled={!isSel && full}
                />
              );
            })}
          </div>
        )}
      </main>

      <SelectionBar
        count={selection.length}
        target={availableSlots}
        minTarget={1}
        confirmHref={buildHref(`${baseHref}/confirmer`, {}, { sel: selection.join(",") })}
        resetHref={hrefFor({ sel: undefined })}
        labelSingular="exposant choisi"
        labelPlural="exposants choisis"
      />
    </>
  );
}
