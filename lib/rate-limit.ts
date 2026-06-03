import { db } from "@/lib/db";

const OTP_WINDOW_MS = 15 * 60 * 1000;
const MAX_SEND_PER_WINDOW = 3;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_PER_EMAIL = 10;
const MAX_LOGIN_PER_IP = 50;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Compteur à fenêtre glissante stocké dans OtpRateLimit (clé arbitraire).
 * Incrémente à chaque appel tant que la fenêtre courante n'est pas saturée.
 */
export async function checkRateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): Promise<RateLimitResult> {
  const now = new Date();
  const windowFloor = new Date(now.getTime() - opts.windowMs);

  const existing = await db.otpRateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowFloor) {
    await db.otpRateLimit.upsert({
      where: { key },
      create: { key, windowStart: now, count: 1 },
      update: { windowStart: now, count: 1 },
    });
    return { allowed: true };
  }

  if (existing.count >= opts.max) {
    const retryAfter = Math.ceil(
      (existing.windowStart.getTime() + opts.windowMs - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) };
  }

  await db.otpRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
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
