import { db } from "@/lib/db";

const OTP_WINDOW_MS = 15 * 60 * 1000;
const MAX_SEND_PER_WINDOW = 3;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_PER_EMAIL = 10;
const MAX_LOGIN_PER_IP = 50;

const INSCRIPTION_WINDOW_MS = 15 * 60 * 1000;
const MAX_INSCRIPTION_PER_IP = 20;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Compteur à fenêtre glissante stocké dans OtpRateLimit (clé arbitraire).
 *
 * Tout se joue dans **un seul ordre SQL** : lire la ligne puis l'écrire en deux
 * temps laissait passer les rafales, toutes les requêtes concurrentes lisant la
 * même valeur avant qu'aucune n'ait incrémenté. `INSERT … ON CONFLICT DO UPDATE`
 * sérialise l'opération côté PostgreSQL et rend le plafond réellement opposable.
 *
 * Le compteur continue de monter sur les requêtes refusées, sans repousser
 * `windowStart` : la fenêtre expire donc à l'heure prévue, un attaquant ne peut
 * pas se maintenir en pénalité indéfiniment au détriment d'un utilisateur.
 */
export async function checkRateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): Promise<RateLimitResult> {
  const now = new Date();
  const windowFloor = new Date(now.getTime() - opts.windowMs);

  const rows = await db.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "OtpRateLimit" ("key", "windowStart", "count")
    VALUES (${key}, ${now}, 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "OtpRateLimit"."windowStart" < ${windowFloor} THEN 1
        ELSE "OtpRateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "OtpRateLimit"."windowStart" < ${windowFloor} THEN ${now}
        ELSE "OtpRateLimit"."windowStart"
      END
    RETURNING "count", "windowStart"
  `;

  const row = rows[0];
  // Le RETURNING d'un upsert ramène toujours une ligne ; en cas contraire on
  // laisse passer plutôt que de bloquer une inscription sur un aléa technique.
  if (!row) return { allowed: true };

  if (row.count > opts.max) {
    const retryAfter = Math.ceil(
      (row.windowStart.getTime() + opts.windowMs - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) };
  }

  return { allowed: true };
}

export function checkOtpSendRateLimit(email: string): Promise<RateLimitResult> {
  return checkRateLimit(`otp_send:${email.toLowerCase()}`, {
    windowMs: OTP_WINDOW_MS,
    max: MAX_SEND_PER_WINDOW,
  });
}

/**
 * Garde anti-brute-force sur la connexion : plafonne les tentatives par email
 * ET par IP (le plus restrictif gagne). À appeler avant chaque `signIn`.
 */
export async function checkLoginRateLimit(
  email: string,
  ip: string | null
): Promise<RateLimitResult> {
  const byEmail = await checkRateLimit(`login:${email.toLowerCase()}`, {
    windowMs: LOGIN_WINDOW_MS,
    max: MAX_LOGIN_PER_EMAIL,
  });
  if (!byEmail.allowed) return byEmail;

  if (ip) {
    const byIp = await checkRateLimit(`login_ip:${ip}`, {
      windowMs: LOGIN_WINDOW_MS,
      max: MAX_LOGIN_PER_IP,
    });
    if (!byIp.allowed) return byIp;
  }

  return { allowed: true };
}

/**
 * Garde sur les cinq formulaires d'inscription, qui sont publics et créent des
 * comptes. Elle vise l'automatisation, pas l'usage humain : le plafond est
 * volontairement large parce que plusieurs personnes peuvent légitimement
 * s'inscrire depuis une même adresse publique — un établissement scolaire, une
 * agence France Travail ou les locaux de la CCI sortent tous derrière une IP
 * unique. Vingt inscriptions par quart d'heure laissent passer un groupe et
 * ramènent une création massive à un rythme inexploitable.
 *
 * Sans IP déterminable, on laisse passer : mieux vaut une inscription non
 * comptée qu'un visiteur bloqué.
 */
export async function checkInscriptionRateLimit(
  ip: string | null
): Promise<RateLimitResult> {
  if (!ip) return { allowed: true };
  return checkRateLimit(`inscription_ip:${ip}`, {
    windowMs: INSCRIPTION_WINDOW_MS,
    max: MAX_INSCRIPTION_PER_IP,
  });
}

/** Message d'attente commun aux formulaires, en minutes arrondies. */
export function messageAttente(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Trop de tentatives depuis votre connexion. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
