/**
 * Bandeau « salon complet » — affiché tant que ConfigurationSalon.salonCompletExposants
 * est actif (cf. lib/salon-complet.ts). Prévient l'entreprise en amont que sa
 * candidature partira en liste d'attente ; la décision reste prise dossier par
 * dossier par la CCI, statut par statut (StatutExposant.LISTE_ATTENTE).
 *
 * Le texte est volontairement impersonnel : le même bandeau sert avant
 * l'inscription (page publique) et après (espace exposant).
 */
export function BandeauSalonComplet({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-accent bg-accent/20 p-4 sm:p-5 text-neutral-900 ${className}`}
    >
      <p className="font-heading font-bold mb-1.5">
        Salon complet — candidatures en liste d&apos;attente
      </p>
      <p className="text-sm leading-relaxed">
        Les 120 stands du salon Made In Val de Loire 2026 sont aujourd&apos;hui
        tous attribués. Les nouvelles candidatures restent les bienvenues :
        elles sont{" "}
        <strong className="font-semibold">placées en liste d&apos;attente</strong>{" "}
        et, en cas de désistement d&apos;un exposant, la CCI revient vers elles
        en priorité pour proposer l&apos;emplacement libéré.
      </p>
    </div>
  );
}
