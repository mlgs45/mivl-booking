import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { InfosStandForm } from "./infos-form";
import { MembresSection } from "./membres-section";

export const metadata = { title: "Mon stand — MIVL Connect" };

export default async function ExposantStandPage() {
  const session = await auth();
  if (!session?.user) return null;

  const exposant = await db.exposant.findUnique({
    where: { userId: session.user.id },
    include: { membresStand: { orderBy: { createdAt: "asc" } } },
  });

  if (!exposant) redirect("/exposant");
  if (exposant.statut !== "VALIDE") redirect("/exposant");

  const standAttribue = Boolean(exposant.numStand || exposant.emplacement);

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700 print:hidden">
          <Link href="/exposant" className="hover:text-primary">Mon espace</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Mon stand</span>
        </div>

        <div className="mb-8 print:hidden">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Mon stand
          </h1>
          <p className="text-sm text-neutral-700 mt-1">
            {exposant.raisonSociale} — Salon du 15 octobre 2026
          </p>
        </div>

        {/* Emplacement attribué par la CCI */}
        <section className="mb-8 rounded-xl border border-neutral-100 bg-white p-6 print:hidden">
          <h2 className="font-heading font-bold text-neutral-900 mb-3">
            Emplacement
          </h2>
          {standAttribue ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StandInfo label="Numéro" value={exposant.numStand} big />
              <StandInfo label="Emplacement" value={exposant.emplacement} />
              <StandInfo
                label="Superficie"
                value={exposant.superficie ? `${exposant.superficie} m²` : null}
              />
            </div>
          ) : (
            <p className="text-sm text-neutral-700">
              Votre emplacement sera attribué par la CCI dans les prochaines
              semaines. Vous serez notifié par email.
            </p>
          )}
        </section>

        {/* Infos du stand (éditables) */}
        <section className="mb-8 rounded-xl border border-neutral-100 bg-white p-6 print:hidden">
          <h2 className="font-heading font-bold text-neutral-900 mb-1">
            Identité du stand
          </h2>
          <p className="text-sm text-neutral-700 mb-4">
            Nom et accroche visibles sur le stand et sur les badges.
          </p>
          <InfosStandForm
            defaultNom={exposant.nomStand}
            defaultAccroche={exposant.accrocheStand}
          />
        </section>

        {/* Équipe + badges */}
        <section className="rounded-xl border border-neutral-100 bg-white p-6">
          <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
            <div>
              <h2 className="font-heading font-bold text-neutral-900 mb-1">
                Équipe sur le stand
              </h2>
              <p className="text-sm text-neutral-700">
                Ajoutez les personnes présentes le jour J. Chaque membre
                reçoit un QR pour le badge d'accès.
              </p>
            </div>
            <span className="shrink-0 text-xs bg-neutral-100 text-neutral-700 font-semibold px-3 py-1.5 rounded-full">
              {exposant.membresStand.length} membre
              {exposant.membresStand.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Header imprimé */}
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold">
              {exposant.raisonSociale} — Badges
            </h1>
            {exposant.numStand && (
              <p className="text-sm">Stand {exposant.numStand}</p>
            )}
          </div>

          <MembresSection
            membres={exposant.membresStand.map((m) => ({
              id: m.id,
              prenom: m.prenom,
              nom: m.nom,
              email: m.email,
              telephone: m.telephone,
              fonction: m.fonction,
              qrToken: m.qrToken,
            }))}
            raisonSociale={exposant.raisonSociale}
            numStand={exposant.numStand}
          />
        </section>
      </main>
    </>
  );
}

function StandInfo({
  label,
  value,
  big,
}: {
  label: string;
  value: string | null;
  big?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      {value ? (
        <p className={`font-heading font-semibold text-neutral-900 ${big ? "text-2xl" : "text-base"}`}>
          {value}
        </p>
      ) : (
        <p className="text-sm italic text-neutral-500">Non défini</p>
      )}
    </div>
  );
}
