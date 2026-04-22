import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import type { TypeAdminToken } from "@prisma/client";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Génère un token en clair (32 bytes en base64url) et enregistre son hash.
 * Invalide les éventuels tokens du même type encore actifs pour cet utilisateur.
 * Retourne le token en clair — à ne JAMAIS persister, juste l'envoyer par email.
 */
export async function creerAdminToken(params: {
  userId: string;
  type: TypeAdminToken;
  creeParId?: string | null;
}): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);

  await db.adminToken.updateMany({
    where: {
      userId: params.userId,
      type: params.type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  await db.adminToken.create({
    data: {
      userId: params.userId,
      type: params.type,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      creeParId: params.creeParId ?? null,
    },
  });

  return token;
}

export type TokenInfo = {
  id: string;
  userId: string;
  type: TypeAdminToken;
  email: string;
  name: string | null;
};

/**
 * Vérifie qu'un token brut est valide (non utilisé, non expiré) et retourne
 * les infos utilisateur. Retourne null sinon.
 */
export async function verifierAdminToken(token: string): Promise<TokenInfo | null> {
  if (!token || token.length < 20) return null;
  const tokenHash = hashToken(token);

  const row = await db.adminToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    email: row.user.email,
    name: row.user.name,
  };
}

export async function consommerAdminToken(tokenId: string): Promise<void> {
  await db.adminToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}

export function statutInvitationEnCours(tokens: Array<{ type: TypeAdminToken; expiresAt: Date; usedAt: Date | null }>):
  | { etat: "aucune" }
  | { etat: "active"; expiresAt: Date }
  | { etat: "expiree" } {
  const invitations = tokens.filter((t) => t.type === "INVITATION" && !t.usedAt);
  if (invitations.length === 0) return { etat: "aucune" };
  const active = invitations.find((t) => t.expiresAt.getTime() > Date.now());
  if (active) return { etat: "active", expiresAt: active.expiresAt };
  return { etat: "expiree" };
}
