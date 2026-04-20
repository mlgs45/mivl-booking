/**
 * Éléments que l'exposant peut présenter sur son stand.
 * Correspond à la question 11 du formulaire d'inscription exposant.
 */
export const ELEMENTS_STAND = [
  { code: "PRODUITS_FABRIQUES", label: "Produits ou pièces fabriquées" },
  { code: "PROTOTYPE_INNOVATION", label: "Prototype / innovation" },
  { code: "MACHINE_EQUIPEMENT", label: "Machine ou équipement industriel" },
  { code: "DEMONSTRATION_TECHNIQUE", label: "Démonstration technique" },
  { code: "SUPPORTS_PEDAGOGIQUES", label: "Supports vidéo ou pédagogiques" },
] as const;

export type ElementStandCode = (typeof ELEMENTS_STAND)[number]["code"];

export const ELEMENT_STAND_LABELS: Record<ElementStandCode, string> =
  Object.fromEntries(ELEMENTS_STAND.map((e) => [e.code, e.label])) as Record<
    ElementStandCode,
    string
  >;

export const ELEMENT_STAND_CODES = ELEMENTS_STAND.map((e) => e.code);

export function isElementStandCode(value: string): value is ElementStandCode {
  return (ELEMENT_STAND_CODES as readonly string[]).includes(value);
}
