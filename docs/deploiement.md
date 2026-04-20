# Guide de déploiement — Coolify + Hetzner

## Infrastructure

| Serveur | IP | Rôle |
|---|---|---|
| compute-01 | 135.181.45.69 | Coolify + app Docker |
| data-01 | *(privé)* | PostgreSQL 16 — base `mivl_booking` |

L'application est exposée sur `https://booking.mivl-orleans.fr`.

---

## 1. Première mise en production

### 1.1 Créer le projet dans Coolify

1. Ouvrir Coolify sur compute-01
2. **New Resource → Application → GitHub (Public/Private)**
3. Sélectionner le repo `mlgs45/mivl-booking`, branche `main`
4. **Build pack → Dockerfile** (Coolify détecte automatiquement le `Dockerfile` à la racine)
5. **Port exposé → 3000**
6. **Domaine → `booking.mivl-orleans.fr`** (Let's Encrypt activé)

### 1.2 Volumes persistants

Dans **Storage → Volumes**, ajouter :

| Source (hôte) | Destination (conteneur) |
|---|---|
| `/data/mivl-booking/uploads` | `/app/uploads` |

### 1.3 Variables d'environnement

Dans **Environment Variables**, renseigner toutes les variables (utiliser `Secret` pour les valeurs sensibles) :

```env
DATABASE_URL=postgresql://mivl_user:PASSWORD@data-01-private-ip:5432/mivl_booking
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://booking.mivl-orleans.fr
BREVO_API_KEY=<clé Brevo>
BREVO_FROM_EMAIL=noreply@mivl-orleans.fr
BREVO_FROM_NAME=MIVL Booking
EMAIL_PROVIDER=brevo
QR_SIGNING_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://booking.mivl-orleans.fr
SUPER_ADMIN_EMAIL=mathieu.langlois@centre.cci.fr
STORAGE_DIR=/app/uploads
NODE_ENV=production
```

### 1.4 Migrations et seed initial

Après le premier déploiement, exécuter une seule fois depuis compute-01 :

```bash
# Se connecter au conteneur en cours d'exécution
docker exec -it <container_id> sh

# À l'intérieur du conteneur
node_modules/.bin/prisma migrate deploy
node_modules/.bin/tsx prisma/seed.ts
```

> `migrate deploy` applique les migrations sans prompt interactif — idéal pour la prod.
> Ne lancer le seed qu'une fois : il crée le compte super admin.

---

## 2. Déploiements suivants

Chaque `git push` sur `main` déclenche automatiquement un nouveau build Coolify (si le webhook GitHub est configuré).

**Sans webhook**, déclencher manuellement depuis Coolify : **Deploy → Redeploy**.

Les migrations sont à appliquer manuellement après chaque déploiement incluant un changement de schéma :

```bash
docker exec -it <container_id> node_modules/.bin/prisma migrate deploy
```

---

## 3. Base de données (data-01)

### Connexion directe

```bash
ssh user@data-01
psql -U mivl_user -d mivl_booking
```

### Backup manuel

```bash
pg_dump -U mivl_user mivl_booking | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restauration

```bash
gunzip -c backup_YYYYMMDD_HHMMSS.sql.gz | psql -U mivl_user mivl_booking
```

---

## 4. Variables à ne jamais commiter

- `AUTH_SECRET`
- `DATABASE_URL` avec mot de passe
- `BREVO_API_KEY`
- `QR_SIGNING_SECRET`

Ces variables sont gérées exclusivement dans l'interface Coolify (champs `Secret`).

---

## 5. Rollback

En cas de problème après un déploiement :

1. Dans Coolify → **Deployments**, sélectionner la version précédente
2. Cliquer **Redeploy this deployment**
3. Si la migration a été appliquée et crée un problème : restaurer un backup DB

---

## 6. Checklist avant mise en prod (15 juin 2026)

- [ ] `AUTH_SECRET` généré et configuré dans Coolify
- [ ] `DATABASE_URL` pointant sur data-01 (réseau privé Hetzner)
- [ ] Volume `/app/uploads` monté
- [ ] DNS `booking.mivl-orleans.fr` → IP compute-01
- [ ] Let's Encrypt activé dans Coolify
- [ ] Webhook GitHub configuré (auto-deploy sur push main)
- [ ] `pnpm db:migrate deploy` exécuté en prod
- [ ] Seed initial exécuté (compte super admin créé)
- [ ] Test connexion `/connexion/admin` avec `mathieu.langlois@centre.cci.fr`
- [ ] Email Brevo fonctionnel (tester magic link)
