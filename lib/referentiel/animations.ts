/**
 * Types d'animations et d'interventions que l'exposant peut proposer.
 * Correspond à la question 12 du formulaire d'inscription exposant.
 * Un tableau vide signifie "pas d'animation proposée".
 */
export const ANIMATIONS = [
  { code: "DEMONSTRATION", label: "Démonstration technique" },
  { code: "PRESENTATION_INNOVATION", label: "Présentation d'une innovation" },
  { code: "TEMOIGNAGE_SAVOIR_FAIRE", label: "Témoignage sur votre savoir-faire industriel" },
  { code: "MINI_CONFERENCE", label: "Mini conférence / prise de parole" },
] as const;

export type AnimationCode = (typeof ANIMATIONS)[number]["code"];

export const ANIMATION_LABELS: Record<AnimationCode, string> = Object.fromEntries(
  ANIMATIONS.map((a) => [a.code, a.label])
) as Record<AnimationCode, string>;

export const ANIMATION_CODES = ANIMATIONS.map((a) => a.code);

export function isAnimationCode(value: string): value is AnimationCode {
  return (ANIMATION_CODES as readonly string[]).includes(value);
}
