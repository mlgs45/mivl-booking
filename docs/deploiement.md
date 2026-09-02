# Guide de déploiement — Coolify + Hetzner

## Infrastructure

| Serveur     | Rôle                                                        |
|-------------|-------------------------------------------------------------|
| compute-01  | Coolify + conteneur applicatif (Next.js)                    |
| data-01     | PostgreSQL 16 (conteneur Coolify) — base `postgres`         |

- App exposée sur `https://connect.mivl-orleans.fr`
- Les deux serveurs sont gérés par Coolify. Les conteneurs portent des noms
  générés (`<uuid-coolify>-<horodatage>`) qui **changent à chaque
  redéploiement** : ne jamais les coder en dur, utiliser les commandes de
  découverte ci-dessous.

> Ce dépôt est **public**. Aucune IP, aucun UUID Coolify et aucun secret ne
> doit être écrit ici — les valeurs réelles se lisent dans l'interface
> Coolify ou via `docker inspect`.

### Accès SSH

Deux alias sont attendus dans `~/.ssh/config` (poste de l'admin) :

| Alias         | Machine     |
|---------------|-------------|
| `htz-compute` | compute-01  |
| `htz-data`    | data-01     |

### Console Coolify

Depuis le 02/09/2026, la console n'est plus joignable par `IP:8000`. Elle est
servie par Traefik sur **https://web.mlanglois.fr** (domaine d'instance déclaré
dans Coolify → *Settings* → *Instance's Domain*), avec certificat Let's Encrypt.
Coolify route lui-même sa console, son temps réel (`/app`) et son terminal
(`/terminal/ws`) à travers ce domaine : les ports 8000, 6001 et 6002 sont
fermés à Internet par `DOCKER-USER` sur compute-01 (cf. §2.6).

En secours, l'accès par tunnel reste possible depuis le poste de l'admin :

```bash
ssh -L 8000:localhost:8000 htz-compute    # puis http://localhost:8000
```

> ⚠️ Le compte administrateur doit avoir la **double authentification** activée
> (profil → *Two Factor Authentication*). La console donne root sur les deux
> serveurs et l'accès à tous les secrets.

### Repérer les conteneurs

Ces snippets se collent **dans** la session SSH : `$APP` et `$DB` restent
alors définis pour toute la durée de la session, et les commandes des
sections suivantes s'y réfèrent. Dans un `ssh htz-data '<commande>'` en une
seule ligne, ces variables n'existent pas — il faut rouvrir une session.

```bash
# Conteneur applicatif, sur compute-01 — identifié par son URL publique
ssh htz-compute
APP=$(docker ps -q | xargs -I{} sh -c \
  'docker inspect {} --format "{{.Name}} {{range .Config.Env}}{{.}} {{end}}"' \
  | grep -m1 "NEXT_PUBLIC_APP_URL=https://connect.mivl-orleans.fr" \
  | awk '{print $1}' | sed 's#^/##')
echo "$APP"

# Conteneur PostgreSQL, sur data-01 — plusieurs bases cohabitent sur la machine,
# on retient celle qui porte le schéma MIVL
ssh htz-data
DB=$(for c in $(docker ps --format '{{.Names}}' | grep -v -- '-proxy'); do
  if docker exec "$c" psql -U postgres -d postgres -tAc \
       "SELECT to_regclass('public.\"Exposant\"');" 2>/dev/null | grep -q Exposant
  then echo "$c"; break; fi
done)
echo "$DB"
```

### Connexion applicative à la base

| Paramètre | Valeur                                                |
|-----------|-------------------------------------------------------|
| Hôte      | IP **privée** de data-01, réseau `10.0.0.0/16` (voir `DATABASE_URL` Coolify) |
| Port      | `5437` (publié par le conteneur proxy Coolify)        |
| Base      | `postgres`                                            |
| Rôle      | `postgres` (seul rôle avec login sur l'instance)      |

> ⚠️ La base ne s'appelle **pas** `mivl_booking` et le rôle `mivl_user`
> n'existe pas — les deux figuraient dans les versions antérieures de ce
> guide et toutes les commandes qui s'en servaient échouaient.

### Réseau privé — en service depuis le 02/09/2026

Les deux serveurs disposent d'une interface privée (`enp7s0`, réseau
`10.0.0.0/16`) et se routent mutuellement dessus. `DATABASE_URL` pointe
désormais l'**IP privée** de data-01, et la règle iptables n'autorise plus que
l'**IP privée** de compute-01 : le trafic applicatif ne transite plus par
Internet.

Bascule réalisée le 02/09/2026. L'ordre ci-dessous est celui qui a été suivi ;
le respecter si l'opération doit être rejouée, sous peine de coupure :

1. sur data-01, autoriser l'IP privée de compute-01 :
   `iptables -I DOCKER-USER -p tcp --dport 5437 -s <ip-privée-compute-01> -j ACCEPT`
2. `netfilter-persistent save`
3. dans Coolify, remplacer l'hôte de `DATABASE_URL` par l'IP privée de
   data-01, puis redéployer
4. vérifier que l'app repart (`docker logs`, `prisma migrate status`), **puis
   seulement alors** retirer la règle `ACCEPT` portant sur l'IP publique de
   compute-01, et sauvegarder

Pour vérifier que le trafic emprunte réellement la voie privée — remettre les
compteurs à zéro, forcer une connexion, relire :

```bash
ssh htz-data 'iptables -Z DOCKER-USER'
# $APP défini comme plus haut, sur compute-01
docker exec "$APP" ./migrator/node_modules/.bin/prisma migrate status
ssh htz-data 'iptables -L DOCKER-USER -v -n | grep 5437'
# attendu : compteur non nul sur la règle privée, zéro sur le DROP
```

> ⚠️ Le pool Prisma conserve ses connexions ouvertes, et le trafic déjà établi
> ne retraverse pas `DOCKER-USER` (conntrack). Charger une page en cache ne
> prouve donc rien : il faut forcer l'ouverture d'une nouvelle connexion.

### ⚠️ Reste à faire : les connexions ne sont pas chiffrées

`ssl` est à `off` côté PostgreSQL, et `pg_stat_ssl.ssl = f` sur toutes les
connexions actives. Le réseau privé met le trafic hors de portée d'Internet,
il ne le chiffre pas : un accès à l'un des deux hôtes ou au réseau du
fournisseur permettrait toujours de le lire en clair. Activer TLS côté serveur
puis passer `sslmode=require` dans `DATABASE_URL` reste à faire.

---

## 1. Pipeline de déploiement

`git push origin main` → webhook Coolify → build Docker → démarrage du conteneur.

Le `Dockerfile` (multi-stage, standalone Next.js) fait **deux choses au démarrage** (voir `CMD` en bas du Dockerfile) :

1. `prisma migrate deploy` — applique les migrations en attente (idempotent, no-op si rien à faire)
2. `node server.js` — lance le serveur Next

**Aucune action manuelle n'est requise pour les migrations.** Si on doit vérifier l'état (`$APP` défini plus haut) :

```bash
docker exec "$APP" ./migrator/node_modules/.bin/prisma migrate status
```

Le CLI Prisma vit dans `./migrator/node_modules/`, mais il est lancé depuis
`/app` et y trouve `prisma/schema.prisma` tout seul. Le `--schema` explicite
du `CMD` du Dockerfile n'est donc pas nécessaire ici.

Réponse attendue : `Database schema is up to date!`

Les logs de démarrage confirment ce qui a été appliqué :

```bash
docker logs --tail 20 "$APP"
```

Vérifier aussi que le conteneur tourne bien sur le commit attendu :

```bash
docker inspect "$APP" --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep SOURCE_COMMIT
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

Contient :

- `/app/uploads/logos/` — logos des exposants téléversés depuis `/exposant/profil` (servis via la route `/api/logos/[filename]`).
- Emplacements futurs pour badges PDF, plannings générés, etc.

**Sans ce volume, les logos sont perdus à chaque redéploiement.**

### 2.3 Variables d'environnement (Coolify → Environment Variables)

Valeurs sensibles → champ `Secret`.

```env
DATABASE_URL=postgres://postgres:PASSWORD@<ip-privée-data-01>:5437/postgres
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://connect.mivl-orleans.fr
BREVO_API_KEY=<clé Brevo>
BREVO_FROM_EMAIL=noreply@mivl-orleans.fr
BREVO_FROM_NAME=MIVL Connect
EMAIL_PROVIDER=brevo
QR_SIGNING_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://connect.mivl-orleans.fr
NEXT_PUBLIC_APP_NAME=MIVL Connect
SUPER_ADMIN_EMAIL=mathieu.langlois@centre.cci.fr
STORAGE_DIR=/app/uploads
NODE_ENV=production
```

`AUTH_TRUST_HOST` figurait dans les versions antérieures de ce guide mais
n'est pas défini sur le conteneur en production, et l'authentification
fonctionne : `AUTH_URL` suffit. Ne pas l'ajouter sans raison.

Pour relire la liste réellement en place (noms seuls, sans les valeurs) :

```bash
docker inspect "$APP" --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | cut -d= -f1 | sort
```

### 2.4 Seed initial — **une seule fois après le 1er build**

`prisma/seed-prod.ts` est idempotent (upsert) — il crée la `ConfigurationSalon` et le super admin sans toucher au reste.

```bash
# Depuis compute-01
docker exec -it \
  -e SUPER_ADMIN_EMAIL=mathieu.langlois@centre.cci.fr \
  -e SUPER_ADMIN_PASSWORD='<mot de passe choisi>' \
  "$APP" node_modules/.bin/tsx prisma/seed-prod.ts
```

> ⚠️ **Ne jamais lancer `prisma/seed.ts` en prod** — ce seed est destructif (fait `deleteMany` sur toutes les tables) et ne sert qu'à recréer l'environnement de dev local.

### 2.5 Sécurité réseau data-01

Le conteneur proxy Coolify publie chaque PostgreSQL sur `0.0.0.0:<port>` — les
ports sont donc exposés sur l'interface publique. data-01 n'a **pas** d'UFW, et
UFW ne filtrerait de toute façon pas le trafic Docker (Docker insère ses règles
au-dessus). La protection est `iptables`, chaîne `DOCKER-USER`, persistée par
`netfilter-persistent` dans `/etc/iptables/rules.v4`.

| Port | Base | Autorisé |
|---|---|---|
| 5437 | MIVL Connect | IP privée de compute-01 uniquement |
| 5440 | (autre projet) | interface privée `enp7s0` uniquement |
| 5433, 5435, 5438, 5439 | pack-objectif, cci-repere, cci-hello, mail-mlgs | IP publique **et** privée de compute-01 |

Les quatre dernières ont été fermées à Internet le 02/09/2026 : elles étaient
entièrement ouvertes, et deux d'entre elles subissaient une force brute
(3 668 et 2 012 tentatives sur sept jours). Leurs applications joignent encore
data-01 par son IP publique ; la règle privée est en place pour permettre la
même bascule que MIVL (§ « Réseau privé ») quand on le décidera.

Modèle de règles pour un nouveau port — **DROP d'abord, puis les ACCEPT** :
`-I` insère en tête, donc l'ordre d'exécution est l'inverse de l'ordre de frappe.

```bash
iptables -I DOCKER-USER 1 -p tcp --dport <port> -j DROP
iptables -I DOCKER-USER 1 -s <ip-privée-compute-01>  -p tcp --dport <port> -j ACCEPT
iptables -I DOCKER-USER 1 -s <ip-publique-compute-01> -p tcp --dport <port> -j ACCEPT   # si l'app passe encore par le public
netfilter-persistent save
```

**État vérifié le 02/09/2026** : règles actives et persistées, ports testés
depuis Internet en timeout, voie compute-01 ouverte.

Contrôler après tout reboot, réinstallation OS ou changement de port :

```bash
ssh htz-data 'iptables -S DOCKER-USER'
nc -z -v -w 6 <ip-publique-data-01> 5437     # attendu : timeout
```

### 2.6 Sécurité réseau compute-01

compute-01 a UFW (politique `INPUT DROP`), mais les ports publiés par Docker le
contournent. Les ports de la console Coolify sont donc fermés dans
`DOCKER-USER`, persistés par `netfilter-persistent` (installé le 02/09/2026 —
il ne l'était pas, les règles n'auraient pas survécu à un redémarrage) :

```
-A DOCKER-USER -i eth0   -p tcp -m conntrack --ctorigdstport 8000 -j DROP
-A DOCKER-USER -i enp7s0 -p tcp -m conntrack --ctorigdstport 8000 -j DROP
-A DOCKER-USER -i eth0   -p tcp --dport 6001 -j DROP     (idem enp7s0, idem 6002)
```

> ⚠️ **Piège : `DOCKER-USER` voit le paquet APRÈS le DNAT.** Coolify publie sa
> console en `8000 → 8080` : quand le paquet atteint `DOCKER-USER`, son port de
> destination est déjà `8080`, et une règle `--dport 8000` ne matche jamais —
> silencieusement (compteur à zéro, port toujours ouvert). Il faut filtrer sur
> le port **d'origine** avec `-m conntrack --ctorigdstport`. Les ports 6001/6002
> et tous les PostgreSQL de data-01 sont publiés à port identique, ce qui masque
> le problème jusqu'au jour où on tombe sur un mapping différent. Vérifier
> toujours depuis l'extérieur, jamais seulement en lisant les règles.

> ⚠️ **Piège : ne jamais mettre de règle sans `-i eth0` sur 6001/6002.** Traefik
> joint lui-même `coolify-realtime:6001/6002` à travers le pont Docker, et une
> règle non qualifiée par interface couperait ce trajet interne — la console
> perdrait le temps réel et le terminal.

### 2.7 SSH (les deux serveurs)

`/etc/ssh/sshd_config.d/99-durcissement.conf` : `PasswordAuthentication no`,
`KbdInteractiveAuthentication no`, `X11Forwarding no`. Aucun compte ne possède de
mot de passe, l'accès est exclusivement par clé. fail2ban est actif (prison
`sshd`). Clés root autorisées : celle de l'admin, celles de Coolify, et sur
data-01 la clé de sauvegarde à commande forcée (§4).

---

## 3. Déploiements suivants

Chaque `git push origin main` déclenche le webhook → build → restart → migrations auto.

**Sans webhook** : Coolify → Deploy → Redeploy.

Rien d'autre à faire côté DB. Si le build échoue, les logs sont dans Coolify → Logs.

### ⚠️ Le build tourne AVANT la migration — piège du blocage circulaire

`next build` s'exécute à la construction de l'image et **se connecte à la base
de prod** (`DATABASE_URL` est passé en `--build-arg`) pour prérendre les pages
statiques. Or `prisma migrate deploy` ne tourne qu'au **démarrage du
conteneur**. L'ordre réel est donc :

```
build (lit la base, schéma ANCIEN)  →  image  →  démarrage  →  migrate deploy  →  serveur
```

Conséquence : une page prérendue qui lit une **colonne ajoutée par la migration
du même commit** casse le build, le conteneur ne démarre pas, la migration
n'est jamais appliquée — et chaque redéploiement rejoue le même échec. Symptôme
dans les logs Coolify :

```
The column `X.y` does not exist in the current database.
Error occurred prerendering page "/…"
```

Deux parades, à choisir avant de pousser :

1. **Lecture tolérante** — la fonction qui lit la nouvelle colonne renvoie une
   valeur par défaut en `catch`. C'est ce que fait `getSalonCompletExposants()`
   dans `lib/salon-complet.ts` (cas vécu le 31/08/2026, colonne
   `ConfigurationSalon.salonCompletExposants`).
2. **Page dynamique** — `export const dynamic = "force-dynamic"` sur la page,
   qui n'est alors plus prérendue au build. Coûte le cache statique.

Se reproduit en local sur une base à l'ancien schéma : `pnpm build` échoue
exactement comme en prod.

---

## 4. Base de données (data-01)

PostgreSQL 16 tourne dans un conteneur Coolify sur data-01. `psql` et
`pg_dump` ne sont pas installés sur l'hôte : tout passe par `docker exec`.
`$DB` est le nom du conteneur (cf. « Repérer les conteneurs »).

### Connexion directe

```bash
ssh htz-data
docker exec -it "$DB" psql -U postgres -d postgres
```

### Sauvegarde automatique quotidienne

En place depuis le 02/09/2026. **Il n'y a plus rien à lancer à la main avant un
push** : la sauvegarde tourne toutes les nuits, et la seule intervention
manuelle utile est de vérifier le journal si un doute survient.

| | |
|---|---|
| Où tourne le travail | **compute-01** — pas sur la machine qu'il sauvegarde |
| Déclenchement | minuterie systemd `mivl-backup.timer`, 03h30 UTC, `Persistent=true` |
| Script | `/usr/local/bin/mivl-backup.sh` |
| Dépôt | `/var/backups/mivl/quotidien/` et `/hebdo/` sur compute-01 |
| Rétention | 14 quotidiennes, 8 hebdomadaires (copie du dimanche) |
| Journal | `/var/log/mivl-backup.log` |
| Alerte | e-mail Brevo à `SUPER_ADMIN_EMAIL` à chaque échec |

Le dump est tiré de data-01 **par le réseau privé**, au moyen d'une clé SSH
dédiée (`/root/.ssh/mivl-backup` sur compute-01) dont l'entrée dans
`authorized_keys` de data-01 porte une **commande forcée** :

```
command="/usr/local/bin/mivl-dump.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty,no-user-rc
```

Cette clé ne permet donc rien d'autre que d'obtenir un dump : toute commande
demandée est ignorée au profit de `mivl-dump.sh`, qui découvre le conteneur
PostgreSQL et émet un `pg_dump` compressé sur la sortie standard.

**Le dump est vérifié avant d'être mis en place** — intégrité `gzip -t`, puis
nombre de tables ≥ 21. Un dump douteux est supprimé, aucune rotation n'a lieu,
et l'alerte part : une sauvegarde valide n'est jamais écrasée par une
sauvegarde ratée.

Contrôler l'état :

```bash
ssh htz-compute 'systemctl list-timers mivl-backup.timer --no-pager'
ssh htz-compute 'tail -5 /var/log/mivl-backup.log'
ssh htz-compute 'ls -lh /var/backups/mivl/quotidien/ | tail -5'
```

Forcer une exécution immédiate (avant une opération sensible, par exemple) :

```bash
ssh htz-compute '/usr/local/bin/mivl-backup.sh && tail -2 /var/log/mivl-backup.log'
```

> ⚠️ **Ce que cette sauvegarde ne couvre pas.** compute-01 est une autre
> machine que data-01, mais chez le même hébergeur. Le dispositif protège
> d'une panne disque, d'une erreur d'exploitation ou d'une suppression
> accidentelle — pas de la perte du compte Hetzner ni d'un sinistre affectant
> le fournisseur. Un dépôt sur un stockage CCI reste à ajouter.
>
> Il ne couvre pas non plus le **volume des logos exposants**
> (`/data/mivl-booking/uploads` sur compute-01), qui n'est pas dans le dump.

### Restauration

> ⚠️ Écrase les données en place. Prévenir la CCI avant, l'app écrit en
> continu (inscriptions exposants, réservations).

```bash
# Depuis le poste local : remonter le dump sur data-01
scp backup_YYYYMMDD_HHMMSS.sql.gz htz-data:/tmp/

# Puis dans la session ssh htz-data, $DB défini
gunzip -c /tmp/backup_YYYYMMDD_HHMMSS.sql.gz \
  | docker exec -i "$DB" psql -U postgres -d postgres
```

### Inspecter sans risque

Pour auditer le schéma sans toucher à la prod, dumper la **structure seule**
(aucune donnée personnelle) et la rejouer sur une base jetable locale :

```bash
# Dans la session ssh htz-data, $DB défini
docker exec "$DB" pg_dump -U postgres -d postgres \
  --schema-only --no-owner --no-privileges > /tmp/prod-schema.sql
exit
scp htz-data:/tmp/prod-schema.sql .
```

Rejoué sur une base jetable locale, ce fichier permet de vérifier qu'une
migration s'applique proprement sur le schéma réel de production avant de
pousser.

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
2. Si une migration fautive a été appliquée : restaurer le dernier backup (cf. §4) puis redéployer la version précédente
3. Prisma ne downgrade pas automatiquement — pour un rollback de schéma, il faut une migration inverse commitée dans le repo

### Reconstruction sur une base vierge — corrigée le 02/09/2026

`prisma migrate deploy` sur une base vide fonctionne : les 19 migrations
s'appliquent dans l'ordre.

Ce n'était pas le cas jusqu'au 02/09/2026. Le dossier
`20260512_visiteur_compte_programme` n'avait qu'un horodatage à 8 chiffres, et
**Prisma trie sur la valeur numérique du préfixe** : `20260512` passait donc
avant `20260512074902_add_visiteur`, qui crée pourtant la table dont il dépend.
La reconstruction s'arrêtait sur `relation "Visiteur" does not exist`.

> Attention au piège de raisonnement : en tri par octets, `0` (0x30) précède
> `_` (0x5F), et l'ordre *paraît* correct. Ce n'est pas le tri qu'applique
> Prisma. Ne pas conclure sans avoir rejoué les migrations sur une base vide.

Correctif appliqué :

1. dossier renommé en `20260512125447_visiteur_compte_programme` — l'horodatage
   est celui de son application réelle en production (12:54:47), et il le place
   après `20260512123207_ouverture_rdv` ;
2. en production, une ligne portant le nouveau nom a d'abord été **ajoutée** à
   `_prisma_migrations` à côté de l'ancienne, avec le même `checksum` : tant que
   les deux lignes coexistaient, l'ancien conteneur comme le nouveau
   répondaient « No pending migrations to apply », et un redémarrage inopiné
   pendant la bascule était sans conséquence ;
3. l'ancienne ligne n'a été supprimée qu'après le redéploiement.

Vérifier que la reconstruction fonctionne toujours — à refaire après toute
nouvelle migration :

```bash
# Sur data-01 : base jetable
ssh htz-data 'docker exec "$DB" psql -U postgres -d postgres \
  -c "DROP DATABASE IF EXISTS migrate_test;" -c "CREATE DATABASE migrate_test;"'

# Sur compute-01 : rejouer l'historique complet dedans, depuis le conteneur
ssh htz-compute
docker exec "$APP" sh -c '
  DB_TEST=$(printf "%s" "$DATABASE_URL" | sed "s|/postgres$|/migrate_test|")
  DATABASE_URL="$DB_TEST" ./migrator/node_modules/.bin/prisma migrate deploy'
# attendu : "All migrations have been successfully applied."

# Puis supprimer la base jetable
```

## 7. Checklist d'un redéploiement sain

- [ ] Typecheck + lint OK en local (`pnpm typecheck && pnpm lint`)
- [ ] Aucune nouvelle variable d'env sans valeur définie dans Coolify
- [ ] Si migration de schéma : la sauvegarde de la nuit est-elle passée ? (`tail -2 /var/log/mivl-backup.log`)
      Au moindre doute, forcer une exécution (§4) — ne pas pousser sans sauvegarde fraîche
- [ ] Si migration de schéma : aucune page prérendue ne lit une colonne ajoutée
      par cette migration sans lecture tolérante (§3, blocage circulaire)
- [ ] Push main → attendre fin du build Coolify (logs verts)
- [ ] `SOURCE_COMMIT` du conteneur = le commit poussé (§1)
- [ ] `docker exec "$APP" ./migrator/node_modules/.bin/prisma migrate status` = « Database schema is up to date! »
- [ ] Si migration de schéma : rejouer l'historique sur une base vierge (§6) — une migration mal horodatée casse la reconstruction sans se voir en production
- [ ] Vérifier `/connexion/admin` : login password OK
- [ ] Vérifier `/connexion` : connexion email + mot de passe OK
- [ ] Vérifier `/mot-de-passe-oublie` : réception du lien Brevo et redéfinition du mot de passe OK
