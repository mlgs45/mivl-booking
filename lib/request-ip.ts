import { headers } from "next/headers";

/**
 * IP cliente derrière le reverse-proxy (Coolify/Traefik pose x-forwarded-for).
 * Retourne null si indéterminable — l'appelant doit gérer ce cas.
 */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return h.get("x-real-ip");
}
