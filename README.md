# MIVL Booking

Plateforme de réservation des rendez-vous du salon **Made In Val de Loire 2026**
— 15 octobre 2026, CO'Met Orléans.

Organisé par la CCI Centre-Val de Loire.

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Auth | Auth.js v5 (magic link + credentials) |
| Base de données | PostgreSQL 16 + Prisma 6 |
| UI | Tailwind CSS 4 + shadcn/ui |
| Email | Brevo (prod) / console (dev) |
| Runtime | Node.js 22, pnpm 10 |
| Déploiement | Docker + Coolify sur Hetzner |

## Prérequis

- Node.js ≥ 22
- pnpm ≥ 10 (`corepack enable pnpm`)
- Docker (OrbStack recommandé sur Mac)

## Installation

```bash
git clone git@github.com:mlgs45/mivl-booking.git
cd mivl-booking
pnpm install
cp .env.example .env.local
# Remplir .env.local (voir section Variables d'environnement)
```

## Démarrage dev

```bash
# 1. Démarrer PostgreSQL
pnpm db:up

# 2. Appliquer les migrations et seed
pnpm db:migrate
pnpm db:seed

# 3. Lancer le serveur de développement
pnpm dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

**Comptes de test :**

| Email | Mot de passe | Rôle |
|---|---|---|
| mathieu.langlois@centre.cci.fr | ChangeMe123! | Super Admin |
| gestionnaire@cci-centre.fr | ChangeMe123! | Gestionnaire |
| Autres utilisateurs seed | — | Magic link (log console) |

## Scripts

| Commande | Description |
|---|---|
| `pnpm dev` | Serveur de développement (Turbopack) |
| `pnpm build` | Build de production |
| `pnpm start` | Serveur de production |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm db:up` | Démarrer PostgreSQL via Docker |
| `pnpm db:migrate` | Appliquer les migrations Prisma |
| `pnpm db:reset` | Reset complet DB + re-seed |
| `pnpm db:seed` | Insérer les données de demo |
| `pnpm db:studio` | Ouvrir Prisma Studio |

## Variables d'environnement

Copier `.env.example` → `.env.local` et renseigner :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL |
| `AUTH_SECRET` | Secret Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` | URL publique de l'app |
| `BREVO_API_KEY` | Clé API Brevo (email prod) |
| `EMAIL_PROVIDER` | `console` (dev) ou `brevo` (prod) |
| `QR_SIGNING_SECRET` | Secret HMAC pour QR codes |

## Architecture

```
app/
  (public)/          Pages publiques (landing, /exposants)
  admin/             Dashboard SUPER_ADMIN / GESTIONNAIRE
  exposant/          Espace exposant
  enseignant/        Espace enseignant
  visiteur/          Espace visiteur (jeune, DE)
  connexion/         Flux d'authentification
  api/auth/          Route handler Auth.js
components/
  layout/            PublicHeader, PublicFooter, AppHeader
  auth/              SignOutButton
  ui/                Composants shadcn/ui
lib/
  db.ts              Singleton Prisma
  auth-redirect.ts   Redirection post-connexion par rôle
  emails/            Service email abstrait + templates
  referentiel/       Secteurs et métiers industriels
prisma/
  schema.prisma      Schéma DB complet
  seed.ts            Données de démonstration
```

## Déploiement

Voir [`docs/deploiement.md`](docs/deploiement.md) pour le guide Coolify complet.
