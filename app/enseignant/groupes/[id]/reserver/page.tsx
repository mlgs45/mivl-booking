import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { BookingFilterBar } from "@/components/booking/filter-bar";
import { ExposantCard } from "@/components/booking/exposant-card";
import { SelectionBar } from "@/components/booking/selection-bar";
import { SECTEUR_CODES } from "@/lib/referentiel/secteurs";
import type { TypeOffre } from "@prisma/client";

export const metadata = { title: "Choisir les exposants — MIVL Booking" };

const OFFRES_POSSIBLES: TypeOffre[] = [
  "DECOUVERTE_ENTREPRISE",
  "DECOUVERTE_METIERS",
  "OPPORTUNITES",
];

const TARGET = 4;

function parseSelection(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean).slice(0, TARGET);
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

export default async function ReserverParcoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sel?: string; secteur?: string; offre?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  const { id } = await params;
  const sp = await searchParams;

  const groupe = await db.groupe.findUnique({
    where: { id },
    include: {
      enseignant: { select: { userId: true } },
      rendezVous: { where: { statut: { not: "ANNULE" } }, select: { id: true } },
    },
  });
  if (!groupe) notFound();
  if (groupe.enseignant.userId !== session.user.id) redirect("/enseignant");
  if (groupe.rendezVous.length > 0) {
    redirect(`/enseignant/groupes/${id}`);
  }

  const selection = parseSelection(sp.sel);

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

  const baseHref = `/enseignant/groupes/${id}/reserver`;
  const selected = new Set(selection);
  const full = selection.length >= TARGET;

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
          <Link href="/enseignant" className="hover:text-primary">Mes groupes</Link>
          <span>/</span>
          <Link href={`/enseignant/groupes/${id}`} className="hover:text-primary">
            {groupe.nom}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Réservation</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Choisissez 4 exposants
          </h1>
          <p className="text-sm text-neutral-700">
            Les créneaux seront attribués automatiquement dans l'ordre de votre sélection à partir de {groupe.creneauArrivee}.
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
        target={TARGET}
        confirmHref={buildHref(`${baseHref}/confirmer`, {}, { sel: selection.join(",") })}
        resetHref={hrefFor({ sel: undefined })}
        labelSingular="exposant choisi"
        labelPlural="exposants choisis"
      />
    </>
  );
}
