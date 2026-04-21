FROM node:22-alpine AS base

# ── Stage 1 : installation des dépendances ────────────────────────────────────
FROM base AS deps
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

# ── Stage 2 : build Next.js ───────────────────────────────────────────────────
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build

# ── Stage 3 : CLI Prisma isolé pour les migrations runtime ───────────────────
# Installation npm pour avoir un node_modules plat (pnpm crée des symlinks
# qui ne se copient pas proprement entre stages Docker).
FROM base AS migrator
WORKDIR /migrator
RUN npm init -y >/dev/null \
 && npm install --omit=dev --no-audit --no-fund prisma@6.19.3

# ── Stage 4 : image de production ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma CLI + schéma pour `prisma migrate deploy` au démarrage
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules ./migrator/node_modules
COPY --from=builder  --chown=nextjs:nodejs /app/prisma ./prisma

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000

# Applique les migrations en attente puis démarre l'app.
# `migrate deploy` est idempotent : no-op si la DB est déjà à jour.
CMD ["sh", "-c", "./migrator/node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node server.js"]
