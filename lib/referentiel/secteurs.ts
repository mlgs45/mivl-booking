/**
 * Univers d'activité du salon Made In Val de Loire.
 * 8 catégories officielles CCI + possibilité de texte libre (secteurAutre).
 * Correspond à la question 10 du formulaire d'inscription exposant.
 */
export const SECTEURS = [
  { code: "AUTO_FERRO_AERO_DEFENSE", label: "Automobile, Ferroviaire, Aéronautique et Défense" },
  { code: "ELEC_MECA_ROBOT_DIGITAL", label: "Electronique, Mécanique, Robotique et Digital" },
  { code: "PLASTURGIE_CHIMIE", label: "Plasturgie et Chimie" },
  { code: "PHARMA_MEDICAL_COSMETIQUE", label: "Pharma, Médical et Cosmétique" },
  { code: "AGROALIMENTAIRE", label: "Agroalimentaire" },
  { code: "MATIERES_EMBALLAGES", label: "Matières et Emballages" },
  { code: "ENERGIE", label: "Énergie" },
  { code: "AUTRES_INDUSTRIES", label: "Autres industries" },
] as const;

export type SecteurCode = (typeof SECTEURS)[number]["code"];

export const SECTEUR_LABELS: Record<SecteurCode, string> = Object.fromEntries(
  SECTEURS.map((s) => [s.code, s.label])
) as Record<SecteurCode, string>;

export const SECTEUR_CODES = SECTEURS.map((s) => s.code);

export function isSecteurCode(value: string): value is SecteurCode {
  return (SECTEUR_CODES as readonly string[]).includes(value);
}
