import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";

export const metadata = { title: "Tableau de bord — Admin MIVL" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const [exposantStats, enseignantStats, userCount] = await Promise.all([
    db.exposant.groupBy({ by: ["statut"], _count: { _all: true } }),
    db.enseignant.groupBy({ by: ["statut"], _count: { _all: true } }),
    db.user.count(),
  ]);

  const byStatut = Object.fromEntries(
    exposantStats.map((s) => [s.statut, s._count._all]),
  );
  const byStatutEnseignant = Object.fromEntries(
    enseignantStats.map((s) => [s.statut, s._count._all]),
  );

  const soumisCount = byStatut.SOUMIS ?? 0;
  const valideCount = byStatut.VALIDE ?? 0;
  const totalExposants = exposantStats.reduce((sum, s) => sum + s._count._all, 0);
  const enseignantsSoumis = byStatutEnseignant.SOUMIS ?? 0;
  const enseignantsValides = byStatutEnseignant.VALIDE ?? 0;
  const totalEnseignants = enseignantStats.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Tableau de bord
          </h1>
          <p className="text-sm text-neutral-700 mt-1">
            Bonjour {session.user.name} — salon du 15 octobre 2026.
          </p>
        </div>

        {/* Alertes à traiter */}
        {(soumisCount > 0 || enseignantsSoumis > 0) && (
          <div className="space-y-2 mb-6">
            {soumisCount > 0 && (
              <Link
                href="/admin/exposants?statut=SOUMIS"
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 hover:bg-primary/8 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
                <p className="text-sm text-primary font-medium">
                  {soumisCount} candidature{soumisCount > 1 ? "s" : ""} exposant
                  {soumisCount > 1 ? "s" : ""} en attente de validation →
                </p>
              </Link>
            )}
            {enseignantsSoumis > 0 && (
              <Link
                href="/admin/enseignants?statut=SOUMIS"
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 hover:bg-primary/8 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
                <p className="text-sm text-primary font-medium">
                  {enseignantsSoumis} inscription{enseignantsSoumis > 1 ? "s" : ""} enseignant
                  {enseignantsSoumis > 1 ? "s" : ""} en attente de validation →
                </p>
              </Link>
            )}
          </div>
        )}

        {/* Stats exposants */}
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">Exposants</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total" value={totalExposants} href="/admin/exposants" />
          <StatCard label="Validés" value={valideCount} href="/admin/exposants?statut=VALIDE" accent="success" />
          <StatCard label="À traiter" value={soumisCount} href="/admin/exposants?statut=SOUMIS" accent={soumisCount > 0 ? "primary" : undefined} />
          <StatCard label="Inscrits (tous rôles)" value={userCount} />
        </div>

        {/* Stats enseignants */}
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">Enseignants</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total" value={totalEnseignants} href="/admin/enseignants" />
          <StatCard label="Validés" value={enseignantsValides} href="/admin/enseignants?statut=VALIDE" accent="success" />
          <StatCard label="À traiter" value={enseignantsSoumis} href="/admin/enseignants?statut=SOUMIS" accent={enseignantsSoumis > 0 ? "primary" : undefined} />
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            href="/admin/exposants"
            title="Gérer les exposants"
            description="Valider les candidatures, consulter les profils, gérer les statuts."
            badge={soumisCount > 0 ? `${soumisCount} en attente` : undefined}
          />
          <ActionCard
            href="/admin/enseignants"
            title="Gérer les enseignants"
            description="Valider les inscriptions des référents enseignants avant leurs réservations."
            badge={enseignantsSoumis > 0 ? `${enseignantsSoumis} en attente` : undefined}
          />
          <ActionCard
            href="/admin/scan"
            title="Scan entrée salon (jour J)"
            description="Flasher les badges QR à l'accueil pour pointer les arrivées."
          />
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: "primary" | "success";
}) {
  const classes = accent === "primary"
    ? "border-primary/20 bg-primary/5"
    : accent === "success"
      ? "border-success/20 bg-success/5"
      : "border-neutral-100 bg-white";
  const valueClasses = accent === "primary"
    ? "text-primary"
    : accent === "success"
      ? "text-success"
      : "text-neutral-900";

  const content = (
    <div className={`rounded-xl border p-5 ${classes}`}>
      <div className={`text-3xl font-bold font-heading ${valueClasses}`}>{value}</div>
      <div className="text-sm text-neutral-700 mt-1">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block hover:scale-[1.01] transition-transform">{content}</Link>;
  }
  return content;
}

function ActionCard({
  href,
  title,
  description,
  badge,
  disabled,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 opacity-60 cursor-not-allowed">
        <h2 className="font-heading font-semibold text-neutral-900 mb-1">{title}</h2>
        <p className="text-sm text-neutral-700">{description}</p>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="block rounded-xl border border-neutral-100 bg-white p-5 hover:border-primary/30 hover:bg-primary/3 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className="font-heading font-semibold text-neutral-900">{title}</h2>
        {badge && (
          <span className="shrink-0 text-xs bg-primary text-white font-semibold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-700">{description}</p>
    </Link>
  );
}
