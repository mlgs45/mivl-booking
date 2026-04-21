import { db } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SEND_PER_WINDOW = 3;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export async function checkOtpSendRateLimit(
  email: string
): Promise<RateLimitResult> {
  const key = `otp_send:${email.toLowerCase()}`;
  const now = new Date();
  const windowFloor = new Date(now.getTime() - WINDOW_MS);

  const existing = await db.otpRateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowFloor) {
    await db.otpRateLimit.upsert({
      where: { key },
      create: { key, windowStart: now, count: 1 },
      update: { windowStart: now, count: 1 },
    });
    return { allowed: true };
  }

  if (existing.count >= MAX_SEND_PER_WINDOW) {
    const retryAfter = Math.ceil(
      (existing.windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) };
  }

  await db.otpRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}
