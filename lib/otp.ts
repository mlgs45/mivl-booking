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
    where: { email: normalized, usedAt: null },
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
  const record = await db.otpCode.findFirst({
    where: { email: normalized, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "invalid" };

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  const attemptHash = hashCode(normalized, code);
  const stored = Buffer.from(record.codeHash, "hex");
  const attempt = Buffer.from(attemptHash, "hex");
  const match = stored.length === attempt.length && timingSafeEqual(stored, attempt);

  if (!match) {
    await db.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    if (remaining <= 0) return { ok: false, reason: "too_many_attempts" };
    return { ok: false, reason: "invalid" };
  }

  await db.otpCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return { ok: true };
}

export async function sendOtpByEmail(email: string): Promise<void> {
  const normalized = email.toLowerCase();
  const code = generateOtp();
  await storeOtp(normalized, code);
  await sendEmail({ to: normalized, template: "otp-code", data: { code } });
}
