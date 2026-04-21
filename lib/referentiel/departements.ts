export const DEPARTEMENTS: Record<string, string> = {
  "18": "Cher",
  "28": "Eure-et-Loir",
  "36": "Indre",
  "37": "Indre-et-Loire",
  "41": "Loir-et-Cher",
  "45": "Loiret",
};

export function departementFromCodePostal(cp: string | null | undefined): string | null {
  if (!cp) return null;
  const match = cp.trim().match(/^\d{2}/);
  return match?.[0] ?? null;
}

export function labelDepartement(code: string): string {
  return DEPARTEMENTS[code] ? `${code} — ${DEPARTEMENTS[code]}` : code;
}
