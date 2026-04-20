/**
 * Référentiel des secteurs industriels du salon Made In Val de Loire.
 * Liste pragmatique à enrichir avec la CCI — prévoir migration si évolution.
 */
export const SECTEURS = [
  { code: "AGRO_ALIMENTAIRE", label: "Agro-alimentaire" },
  { code: "AERONAUTIQUE", label: "Aéronautique & Spatial" },
  { code: "AUTOMOBILE", label: "Automobile & Mobilité" },
  { code: "BATIMENT", label: "Bâtiment & Travaux publics" },
  { code: "BOIS_AMEUBLEMENT", label: "Bois & Ameublement" },
  { code: "CHIMIE", label: "Chimie & Pharmacie" },
  { code: "COSMETIQUE", label: "Cosmétique & Parfumerie" },
  { code: "ELECTRONIQUE", label: "Électronique & Électrotechnique" },
  { code: "ENERGIE", label: "Énergie & Environnement" },
  { code: "IMPRESSION_3D", label: "Fabrication additive & Impression 3D" },
  { code: "IMPRIMERIE", label: "Imprimerie & Édition" },
  { code: "LOGISTIQUE", label: "Logistique & Supply chain" },
  { code: "MAINTENANCE", label: "Maintenance industrielle" },
  { code: "MECANIQUE", label: "Mécanique & Usinage" },
  { code: "METALLURGIE", label: "Métallurgie & Sidérurgie" },
  { code: "NUMERIQUE", label: "Numérique & Industrie 4.0" },
  { code: "PACKAGING", label: "Packaging & Emballage" },
  { code: "PLASTURGIE", label: "Plasturgie & Composites" },
  { code: "TEXTILE", label: "Textile & Cuir" },
  { code: "VERRE_CERAMIQUE", label: "Verre & Céramique" },
] as const;

export type SecteurCode = (typeof SECTEURS)[number]["code"];

export const SECTEUR_LABELS: Record<SecteurCode, string> = Object.fromEntries(
  SECTEURS.map((s) => [s.code, s.label])
) as Record<SecteurCode, string>;

export const SECTEUR_CODES = SECTEURS.map((s) => s.code);
