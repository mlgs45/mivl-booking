/**
 * Référentiel des métiers de l'industrie pour le salon MIVL.
 * Liste pragmatique structurée par famille. À enrichir avec la CCI si besoin
 * (rapprochement possible de la nomenclature ROME v4 en v2).
 */
export const FAMILLES_METIERS = [
  {
    code: "PRODUCTION",
    label: "Production & Fabrication",
    metiers: [
      { code: "OPERATEUR_PROD", label: "Opérateur·rice de production" },
      { code: "CONDUCTEUR_LIGNE", label: "Conducteur·rice de ligne" },
      { code: "REGLEUR", label: "Régleur·euse" },
      { code: "TECHNICIEN_FABRICATION", label: "Technicien·ne de fabrication" },
      { code: "CHEF_EQUIPE_PROD", label: "Chef·fe d'équipe production" },
      { code: "RESPONSABLE_PROD", label: "Responsable de production" },
    ],
  },
  {
    code: "MAINTENANCE",
    label: "Maintenance & Fiabilité",
    metiers: [
      { code: "TECHNICIEN_MAINTENANCE", label: "Technicien·ne de maintenance" },
      { code: "ELECTROMECANICIEN", label: "Électromécanicien·ne" },
      { code: "AUTOMATICIEN", label: "Automaticien·ne" },
      { code: "RESPONSABLE_MAINTENANCE", label: "Responsable maintenance" },
    ],
  },
  {
    code: "BUREAU_ETUDES",
    label: "Bureau d'études & Conception",
    metiers: [
      { code: "DESSINATEUR_INDUS", label: "Dessinateur·rice industriel" },
      { code: "PROJETEUR", label: "Projeteur·euse" },
      { code: "INGENIEUR_BE", label: "Ingénieur·e bureau d'études" },
      { code: "INGENIEUR_RD", label: "Ingénieur·e R&D" },
    ],
  },
  {
    code: "QUALITE",
    label: "Qualité, Hygiène, Sécurité, Environnement",
    metiers: [
      { code: "TECHNICIEN_QUALITE", label: "Technicien·ne qualité" },
      { code: "CONTROLEUR_QUALITE", label: "Contrôleur·euse qualité" },
      { code: "ANIMATEUR_QHSE", label: "Animateur·rice QHSE" },
      { code: "RESPONSABLE_QHSE", label: "Responsable QHSE" },
    ],
  },
  {
    code: "METHODES",
    label: "Méthodes & Industrialisation",
    metiers: [
      { code: "TECHNICIEN_METHODES", label: "Technicien·ne méthodes" },
      { code: "INGENIEUR_METHODES", label: "Ingénieur·e méthodes" },
      { code: "INGENIEUR_INDUSTRIALISATION", label: "Ingénieur·e industrialisation" },
      { code: "ANIMATEUR_AMELIORATION", label: "Animateur·rice amélioration continue (Lean)" },
    ],
  },
  {
    code: "USINAGE",
    label: "Usinage & Travail des métaux",
    metiers: [
      { code: "TOURNEUR_FRAISEUR", label: "Tourneur·euse / Fraiseur·euse" },
      { code: "OPERATEUR_CN", label: "Opérateur·rice sur commande numérique" },
      { code: "PROGRAMMEUR_CN", label: "Programmeur·euse commande numérique" },
      { code: "CHAUDRONNIER", label: "Chaudronnier·ère" },
      { code: "SOUDEUR", label: "Soudeur·euse" },
    ],
  },
  {
    code: "LOGISTIQUE",
    label: "Logistique & Supply chain",
    metiers: [
      { code: "CARISTE", label: "Cariste" },
      { code: "PREPARATEUR_COMMANDES", label: "Préparateur·rice de commandes" },
      { code: "GESTIONNAIRE_STOCK", label: "Gestionnaire de stock" },
      { code: "RESPONSABLE_LOGISTIQUE", label: "Responsable logistique" },
      { code: "APPROVISIONNEUR", label: "Approvisionneur·euse" },
    ],
  },
  {
    code: "INFORMATIQUE_IND",
    label: "Informatique industrielle & Numérique",
    metiers: [
      { code: "DEV_LOGICIEL", label: "Développeur·euse logiciel" },
      { code: "DEV_WEB", label: "Développeur·euse web / applications" },
      { code: "ADMIN_SYS", label: "Administrateur·rice systèmes & réseaux" },
      { code: "TECH_SUPPORT_IT", label: "Technicien·ne support IT" },
      { code: "DATA_ANALYST", label: "Data analyst / Data engineer" },
    ],
  },
  {
    code: "COMMERCE",
    label: "Commercial & Relation client",
    metiers: [
      { code: "COMMERCIAL_BTOB", label: "Commercial·e BtoB" },
      { code: "CHARGE_AFFAIRES", label: "Chargé·e d'affaires" },
      { code: "ASSISTANT_COMMERCIAL", label: "Assistant·e commercial·e / ADV" },
      { code: "RESPONSABLE_COMMERCIAL", label: "Responsable commercial·e" },
    ],
  },
  {
    code: "ADMIN_RH",
    label: "Administration, RH & Support",
    metiers: [
      { code: "ASSISTANT_RH", label: "Assistant·e RH" },
      { code: "CHARGE_RECRUTEMENT", label: "Chargé·e de recrutement" },
      { code: "COMPTABLE", label: "Comptable" },
      { code: "CONTROLEUR_GESTION", label: "Contrôleur·euse de gestion" },
    ],
  },
] as const;

export const METIERS = FAMILLES_METIERS.flatMap((famille) =>
  famille.metiers.map((m) => ({
    ...m,
    famille: famille.code,
    familleLabel: famille.label,
  }))
);

export type MetierCode = (typeof METIERS)[number]["code"];

export const METIER_LABELS: Record<string, string> = Object.fromEntries(
  METIERS.map((m) => [m.code, m.label])
);

export const METIER_CODES = METIERS.map((m) => m.code);
