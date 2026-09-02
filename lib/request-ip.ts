import { headers } from "next/headers";

/**
 * IP cliente derrière le reverse-proxy (Coolify/Traefik pose `x-forwarded-for`).
 *
 * On retient le **dernier** élément de la liste, pas le premier. Le proxy
 * *ajoute* à la fin l'adresse qu'il observe ; tout ce qui précède a été fourni
 * par le client lui-même et n'engage que lui. Prendre le premier élément
 * laisserait n'importe qui choisir son IP en posant son propre en-tête, et
 * donc contourner les plafonds par adresse (cf. `lib/rate-limit.ts`).
 *
 * Vrai tant qu'un seul proxy de confiance se trouve devant l'application. Si
 * un second intermédiaire était ajouté un jour (CDN, pare-feu applicatif), il
 * faudrait remonter d'autant dans la liste.
 *
 * Retourne null si indéterminable — l'appelant doit gérer ce cas.
 */
export async function clientIp(): Promise<string | null> {
  const h = await headers();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const maillons = forwarded
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const dernier = maillons[maillons.length - 1];
    if (dernier) return dernier;
  }

  return h.get("x-real-ip");
}
