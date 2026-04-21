# Guide de déploiement — Coolify + Hetzner

## Infrastructure

| Serveur     | Rôle                                             |
|-------------|--------------------------------------------------|
| compute-01  | Coolify + conteneur applicatif (Next.js)         |
| data-01     | PostgreSQL 16 — base `mivl_booking`              |

- App exposée sur `https://connect.mivl-orleans.fr`
- data-01 joignable uniquement depuis compute-01 via le réseau privé Hetzner

---

## 1. Pipeline de déploiement

`git push origin main` → webhook Coolify → build Docker → démarrage du conteneur.

Le `Dockerfile` (multi-stage, standalone Next.js) fait **deux choses au démarrage** (voir `CMD` en bas du Dockerfile) :

1. `prisma migrate deploy` — applique les migrations en attente (idempotent, no-op si rien à faire)
2. `node server.js` — lance le serveur Next

**Aucune action manuelle n'est requise pour les migrations.** Si on doit vérifier l'état :

```bash
docker exec <container_id> ./migrator/node_modules/.bin/prisma migrate status
```

---

## 2. Première mise en production (historique — 20/04/2026)

### 2.1 Coolify

1. **New Resource → Application → GitHub** — repo `mlgs45/mivl-booking`, branche `main`
2. **Build pack → Dockerfile** (détection auto à la racine)
3. **Port → 3000**
4. **Domain → `connect.mivl-orleans.fr`** + Let's Encrypt

### 2.2 Volume persistant

| Source (hôte)                     | Destination (conteneur) |
|-----------------------------------|-------------------------|
| `/data/mivl-booking/uploads`      | `/app/uploads`          |

### 2.3 Variables d'environnement (Coolify → Environment Variables)

Valeurs sensibles → champ `Secret`.

```env
DATABASE_URL=postgresql://mivl_user:PASSWORD@<data-01-private-ip>:5432/mivl_booking
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://connect.mivl-orleans.fr
AUTH_TRUST_HOST=true
BREVO_API_KEY=<clé Brevo>
BREVO_FROM_EMAIL=noreply@mivl-orleans.fr
BREVO_FROM_NAME=MIVL Connect
EMAIL_PROVIDER=brevo
QR_SIGNING_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://connect.mivl-orleans.fr
SUPER_ADMIN_EMAIL=mathieu.langlois@centre.cci.fr
STORAGE_DIR=/app/uploads
NODE_ENV=production
```

### 2.4 Seed initial — **une seule fois après le 1er build**

`prisma/seed-prod.ts` est idempotent (upsert) — il crée la `ConfigurationSalon` et le super admin sans toucher au reste.

```bash
# Depuis compute-01
docker exec -it \
  -e SUPER_ADMIN_EMAIL=mathieu.langlois@centre.cci.fr \
  -e SUPER_ADMIN_PASSWORD='<mot de passe choisi>' \
  <container_id> node_modules/.bin/tsx prisma/seed-prod.ts
```

> ⚠️ **Ne jamais lancer `prisma/seed.ts` en prod** — ce seed est destructif (fait `deleteMany` sur toutes les tables) et ne sert qu'à recréer l'environnement de dev local.

### 2.5 Sécurité réseau data-01

UFW ne filtre pas le trafic Docker (Docker insère ses règles **au-dessus** de celles d'UFW). La DB est donc protégée par `iptables` directement, dans la chaîne `DOCKER-USER` :

```bash
# Sur data-01
iptables -I DOCKER-USER -p tcp --dport 5432 -s <ip-privée-compute-01> -j ACCEPT
iptables -I DOCKER-USER -p tcp --dport 5432 -j DROP

# Persister (package iptables-persistent)
netfilter-persistent save
```

À vérifier après tout reboot de data-01 ou réinstallation OS.

---

## 3. Déploiements suivants

Chaque `git push origin main` déclenche le webhook → build → restart → migrations auto.

**Sans webhook** : Coolify → Deploy → Redeploy.

Rien d'autre à faire côté DB. Si le build échoue, les logs sont dans Coolify → Logs.

---

## 4. Base de données (data-01)

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

## 5. Variables à ne jamais commiter

- `AUTH_SECRET`
- `DATABASE_URL` avec mot de passe
- `BREVO_API_KEY`
- `QR_SIGNING_SECRET`
- `SUPER_ADMIN_PASSWORD` (uniquement passé à la main au seed initial)

Ces variables vivent dans l'interface Coolify (champs `Secret`).

---

## 6. Rollback

1. Coolify → **Deployments** → sélectionner la version précédente → **Redeploy this deployment**
2. Si une migration fautive a été appliquée : restaurer le dernier backup (`gunzip ... | psql ...`) puis redéployer la version précédente
3. Prisma ne downgrade pas automatiquement — pour un rollback de schéma, il faut une migration inverse commitée dans le repo

---

## 7. Checklist d'un redéploiement sain

- [ ] Typecheck + lint OK en local (`pnpm typecheck && pnpm lint`)
- [ ] Aucune nouvelle variable d'env sans valeur définie dans Coolify
- [ ] Si migration de schéma : dump DB avant push (`pg_dump ...`)
- [ ] Push main → attendre fin du build Coolify (logs verts)
- [ ] Vérifier `/connexion/admin` : login password OK
- [ ] Vérifier `/connexion` : envoi OTP + réception Brevo + validation code OK
- [ ] `docker exec <container> ./migrator/node_modules/.bin/prisma migrate status` = à jour
