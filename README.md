# Registrar Studio218

Web platform to check whether `.fr` domain names are available for registration using the [AFNIC Phoenix API](https://api-sandbox.nic.fr/api-docs/).

## Features

- Search one or many domains from a text input
- Upload a CSV file for bulk checks
- View availability, reason, and validation errors in a table
- Export results as CSV
- Backend proxy with Keycloak authentication (credentials stay server-side)

## Project structure

- `frontend/` — React + Vite UI
- `backend/` — Express API proxy to AFNIC
- `api-doc.yml` — OpenAPI specification
- `examples/sample-domains.csv` — example CSV input

## Prerequisites

- Node.js 20+
- Docker (recommended) or PostgreSQL 16+
- AFNIC registrar credentials in `.env` for real API calls (or use mock mode)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
npm run docker:db
```

3. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

4. Configure `.env`:

- `DATABASE_URL` — PostgreSQL connection string (default matches `docker:db`)
- `MOCK_AFNIC=true` for local UI testing without AFNIC credentials
- `KEYCLOAK_USERNAME` / `KEYCLOAK_PASSWORD` — registrar credentials (server-side only, never exposed to clients)

## Run in development

Start the backend in Docker, then the Vite frontend:

```bash
docker compose up -d app
npm run dev
```

- Frontend: `http://localhost:5173` (proxies `/api` to the backend)
- Backend API: `http://localhost:3001` (Docker)

Or use the built UI served by Docker at `http://localhost:3001`.

`npm run dev:all` still starts a local Node backend, but on Windows this often fails if another PostgreSQL instance is already bound to port `5432`. Prefer Docker for the API.

## Run with Docker

Build and start the app + PostgreSQL:

```bash
docker compose up --build
```

- App: `http://localhost:3001` (API + built frontend)
- PostgreSQL: `localhost:5432` (user/password/db: `afnic`)

Useful commands:

```bash
npm run docker:up    # compose up --build
npm run docker:down  # compose down
npm run docker:db    # postgres only (for local npm run dev)
```

Pass AFNIC credentials via `.env` or shell when starting Docker:

```bash
MOCK_AFNIC=false KEYCLOAK_USERNAME=... KEYCLOAK_PASSWORD=... docker compose up --build
```

## API endpoints (local backend)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check, database status, and mock mode |
| `GET` | `/api/auth/status` | Current client session status |
| `POST` | `/api/auth/register` | Register a client account and create an AFNIC contact |
| `POST` | `/api/auth/login` | Log in with `{ "email", "password" }` |
| `POST` | `/api/auth/logout` | End the current session |
| `POST` | `/api/domains/check` | Check domains from JSON `{ "names": ["example.fr"] }` |
| `POST` | `/api/domains/check/csv` | Upload CSV (`multipart/form-data`, field `file`) |
| `POST` | `/api/domains/register` | Register an available domain for the logged-in client |

## CSV format

```csv
domain
example.fr
mybrand
another-name.fr
```

Supported headers: `domain`, `name`, `domain_name`, `domainname`, `fqdn`. If no recognized header exists, the first column is used. Comma and semicolon separators are auto-detected.

Domains without a TLD automatically get `.fr` appended when `AUTO_APPEND_FR_SUFFIX=true`.

## Mock mode

When `MOCK_AFNIC=true`, the backend returns simulated availability:

- `example`, `nic`, names containing `taken`, or starting with `reserved` are unavailable
- other names are available

Use this to develop the UI before AFNIC credentials are available.

## Build

```bash
npm run build
```

## Notes

- Eligibility in v1 means `available === true` from `POST /v1/domains/check`
- Large CSV uploads are chunked (default: 50 domains per AFNIC request)
- Payment and registration are out of scope for this tool
