/**
 * Lit un FormData posté par le formulaire profil exposant et le transforme en objet
 * compatible avec les schémas Zod (cases à cocher multiples → tableaux, booléens).
 * Partagé entre l'action exposant (auto-service) et l'action admin (édition libre).
 */
export function extractProfilFromFormData(formData: FormData) {
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  const all = (k: string) =>
    formData.getAll(k).filter((v): v is string => typeof v === "string");
  const bool = (k: string) => formData.get(k) === "on";

  return {
    raisonSociale: str("raisonSociale"),
    siret: str("siret") ?? "",
    adresse: str("adresse"),
    ville: str("ville"),
    codePostal: str("codePostal") ?? "",
    siteWeb: str("siteWeb") ?? "",
    nomContact: str("nomContact"),
    telephoneContact: str("telephoneContact"),
    fonctionContact: str("fonctionContact"),

    secteurs: all("secteurs"),
    secteurAutre: str("secteurAutre"),
    description: str("description"),

    offres: all("offres"),
    typesOpportunites: all("typesOpportunites"),
    metiersProposes: all("metiersProposes"),

    elementsStand: all("elementsStand"),
    elementsStandAutre: str("elementsStandAutre"),

    animations: all("animations"),

    ressourcesMatin: str("ressourcesMatin"),
    ressourcesApresMidi: str("ressourcesApresMidi"),

    innovationMiseEnAvant: bool("innovationMiseEnAvant"),
    descriptionInnovation: str("descriptionInnovation"),

    statutRecrutement: str("statutRecrutement") || "NON",

    consentementCommunication: bool("consentementCommunication"),
  };
}

export function issuesToErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}
