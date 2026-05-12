/**
 * Univers d'activité du salon Made In Val de Loire.
 * 8 catégories officielles CCI + possibilité de texte libre (secteurAutre).
 */
export const SECTEURS = [
  { code: "AUTOMOBILE_FERROVIAIRE",          label: "Automobile & Ferroviaire" },
  { code: "AERONAUTIQUE_DEFENSE",            label: "Aéronautique & Défense" },
  { code: "ELEC_MECA_ROBOT_DIGITAL",         label: "Électronique, Mécanique, Robotique & Digital" },
  { code: "PLASTURGIE_CHIMIE_MATERIAUX",     label: "Plasturgie, Chimie, Matériaux & Emballage" },
  { code: "ENERGIE_ENVIRONNEMENT",           label: "Énergie et environnement" },
  { code: "PHARMA_MEDICAL_COSMETIQUE",       label: "Pharma, Médical & Cosmétique" },
  { code: "AGROALIMENTAIRE",                 label: "Agroalimentaire" },
  { code: "AUTRES_INDUSTRIES",               label: "Autres industries" },
] as const;

export type SecteurCode = (typeof SECTEURS)[number]["code"];

export const SECTEUR_LABELS: Record<SecteurCode, string> = Object.fromEntries(
  SECTEURS.map((s) => [s.code, s.label])
) as Record<SecteurCode, string>;

export const SECTEUR_CODES = SECTEURS.map((s) => s.code);

export function isSecteurCode(value: string): value is SecteurCode {
  return (SECTEUR_CODES as readonly string[]).includes(value);
}
