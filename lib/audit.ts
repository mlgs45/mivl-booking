import { createHash } from "node:crypto";

/**
 * Empreinte non réversible d'une adresse e-mail, pour les journaux d'audit.
 *
 * Le journal des échecs de connexion accueille les adresses **saisies**, donc
 * potentiellement celles de tiers, entrées par n'importe qui — y compris lors
 * d'un test d'énumération. Les conserver en clair sans durée de vie revient à
 * constituer une liste d'adresses dans une table qui n'en a pas besoin.
 *
 * On garde donc une empreinte tronquée, plus le domaine — qui n'identifie
 * personne mais permet de reconnaître une attaque visant un établissement. Un
 * administrateur qui enquête sur un compte précis retrouve la ligne en hachant
 * l'adresse concernée de la même façon.
 */
export function empreinteEmail(email: string): { hash: string; domaine: string } {
  const normalise = email.trim().toLowerCase();
  const hash = createHash("sha256").update(normalise).digest("hex").slice(0, 16);
  const domaine = normalise.split("@")[1] ?? "inconnu";
  return { hash, domaine };
}
