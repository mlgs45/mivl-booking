import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(email: string, code: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant");
  return createHash("sha256")
    .update(`${email}:${code}:${secret}`)
    .digest("hex");
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function storeOtp(email: string, code: string): Promise<void> {
  const normalized = email.toLowerCase();
  await db.otpCode.deleteMany({
    where: { email: normalized, expiresAt: { lt: new Date() } },
  });
  await db.otpCode.create({
    data: {
      email: normalized,
      codeHash: hashCode(normalized, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

export async function verifyOtp(
  email: string,
  code: string
): Promise<VerifyResult> {
  const normalized = email.toLowerCase();
  const attemptHash = hashCode(normalized, code);
  const now = new Date();

  const match = await db.otpCode.findFirst({
    where: {
      email: normalized,
      codeHash: attemptHash,
      usedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: MAX_ATTEMPTS },
    },
  });

  if (match) {
    await db.otpCode.update({
      where: { id: match.id },
      data: { usedAt: new Date() },
    });
    return { ok: true };
  }

  const activeCount = await db.otpCode.count({
    where: {
      email: normalized,
      usedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (activeCount === 0) {
    return { ok: false, reason: "expired" };
  }

  await db.otpCode.updateMany({
    where: {
      email: normalized,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { attempts: { increment: 1 } },
  });

  const remaining = await db.otpCode.count({
    where: {
      email: normalized,
      usedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: MAX_ATTEMPTS },
    },
  });

  if (remaining === 0) return { ok: false, reason: "too_many_attempts" };
  return { ok: false, reason: "invalid" };
}

export async function sendOtpByEmail(email: string): Promise<void> {
  const normalized = email.toLowerCase();
  const code = generateOtp();
  await storeOtp(normalized, code);
  await sendEmail({ to: normalized, template: "otp-code", data: { code } });
}
