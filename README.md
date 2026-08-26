# Studio 218 — Noms de domaine `.fr`

Plateforme web pour les clients de l’agence : vérifier la disponibilité de noms `.fr` et les réserver via l’[API AFNIC Phoenix](https://api-sandbox.nic.fr/api-docs/).

Production actuelle : [names.studio218.fr](https://names.studio218.fr)

## Fonctionnalités

- Recherche d’un ou plusieurs domaines (saisie ou import de liste CSV)
- Filtres disponibles / indisponibles, sélection multiple et réservation en lot
- Page **Mes domaines** avec statut actif / annulé (vérifié auprès d’AFNIC)
- Inscription client (contact AFNIC) et connexion par session
- Thème moderne (Studio 218) ; interface rétro Win98 réservée aux admins
- Menu compte : Mes domaines, Paramètres (admin), Déconnexion
- Identifiants registrar AFNIC côté serveur uniquement (Keycloak)

## Structure

- `frontend/` — React + Vite
- `backend/` — API Express (proxy AFNIC, auth, enregistrements)
- `api-doc.yml` — spécification OpenAPI AFNIC
- `examples/` — CSV d’exemple
- `.github/workflows/deploy.yml` — déploiement auto sur push de la branche `push`

## Prérequis

- Node.js 20+
- Docker (recommandé) ou PostgreSQL 16+
- Identifiants registrar AFNIC dans `.env` (ou `MOCK_AFNIC=true`)

## Configuration

```bash
cp .env.example .env
```

Variables importantes :

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Postgres (défaut local : `postgres://afnic:afnic@localhost:5432/afnic`) |
| `MOCK_AFNIC` | `true` = réponses simulées |
| `AFNIC_ENV` | `sandbox` ou `production` |
| `KEYCLOAK_USERNAME` / `KEYCLOAK_PASSWORD` | Identifiants API registrar AFNIC |
| `KEYCLOAK_*_SANDBOX` / `KEYCLOAK_*_PRODUCTION` | Overrides optionnels par environnement |
| `ADMIN_EMAILS` | E-mails admin (séparés par des virgules) |
| `AFNIC_DEFAULT_ADMIN_CONTACT_ID` | Contact admin/tech à l’enregistrement |
| `DEFAULT_DOMAIN_DURATION_YEARS` | Durée d’enregistrement (défaut `1`) |
| `SESSION_SECRET` | Secret de session (obligatoire en prod) |
| `SESSION_COOKIE_SECURE` | `true` derrière HTTPS |
| `FRONTEND_ORIGIN` | Origine(s) CORS autorisée(s), ex. `https://names.studio218.fr` |

## Développement local

Préférez Docker pour l’API (évite les conflits Postgres Windows sur le port `5432`) :

```bash
docker compose up -d db    # Postgres seul
# ou
docker compose up -d app   # API + frontend build + Postgres

npm install
npm install --prefix frontend
npm run dev                # Vite → http://localhost:5173 (proxy /api → :3001)
```

- Frontend : `http://localhost:5173`
- API : `http://localhost:3001`

`npm run dev:all` lance aussi un backend Node local ; sur Windows, démarrez d’abord Docker Desktop et `docker compose up -d db`.

## Docker (build complet)

```bash
docker compose up --build
```

- App : `http://localhost:3001`
- Postgres : `localhost:5432` (user/password/db : `afnic` en compose de dev)

```bash
npm run docker:up      # compose up --build
npm run docker:down
npm run docker:db      # Postgres seul
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | Santé, DB, mode mock / environnement |
| `GET` | `/api/auth/status` | Session courante |
| `POST` | `/api/auth/register` | Créer un compte + contact AFNIC |
| `POST` | `/api/auth/login` | Connexion `{ "email", "password" }` |
| `POST` | `/api/auth/logout` | Déconnexion |
| `POST` | `/api/auth/environment` | Changer sandbox/prod (admin) |
| `POST` | `/api/domains/check` | Vérifier `{ "names": ["exemple.fr"] }` |
| `POST` | `/api/domains/check/csv` | Vérifier via CSV (`file`) |
| `POST` | `/api/domains/register` | Enregistrer un domaine `{ "domain" }` |
| `GET` | `/api/domains/registrations` | Domaines du client connecté (+ statut) |

## CSV

```csv
domain
example.fr
mybrand
another-name.fr
```

En-têtes reconnus : `domain`, `name`, `domain_name`, `domainname`, `fqdn`. Sinon, première colonne. Séparateurs `,` / `;` détectés automatiquement. Sans TLD, `.fr` est ajouté si `AUTO_APPEND_FR_SUFFIX=true`.

## Mode mock

Avec `MOCK_AFNIC=true` :

- Indisponibles : `example`, `nic`, noms contenant `taken`, ou commençant par `reserved`
- Les autres sont disponibles

## Déploiement VPS

L’app tourne typiquement derrière **Traefik** (ex. Coolify déjà présent) sans republier les ports 80/443.

- Branche de déploiement : **`push`**
- Workflow GitHub Actions : SSH → `git fetch` → restore `.env` + `docker-compose.yml` serveur → `docker compose up --build -d`
- Secrets GitHub requis : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, optionnel `VPS_APP_DIR` (défaut `/opt/api-afnic`)

Les fichiers `.env` et `docker-compose.yml` **du serveur** (labels Traefik, secrets) sont conservés à chaque déploiement.

Flux habituel :

```bash
git checkout main
# … commits …
git checkout push
git merge main
git push origin push
```

## Build

```bash
npm run build
```

## Notes

- Un domaine est réservable si `available === true` sur le check AFNIC
- Les lots de vérification sont découpés (max AFNIC : 7 noms par requête)
- Le paiement n’est pas géré dans cette application
