# Domain Eligibility Lookup Platform

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
- AFNIC sandbox Keycloak credentials (or use mock mode)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

3. Configure `.env`:

- For local UI testing without AFNIC credentials, keep `MOCK_AFNIC=true`
- For real sandbox checks, set `MOCK_AFNIC=false` and log in through the app with your AFNIC username and password

Authentication follows the [official AFNIC samples](gitlab-nic/code-samples-main/API/Python/afnic.py):

- `username` / `password` = your extranet credentials (same as `~/.afnic-api`)
- `client_id` = `registrars-api-client` (OAuth client, **not** your extranet login)

## Run in development

From the project root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Vite proxies `/api/*` to the backend

## API endpoints (local backend)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check and mock mode status |
| `GET` | `/api/auth/status` | Current login session status |
| `POST` | `/api/auth/login` | Log in with `{ "username", "password" }` and store AFNIC token server-side |
| `POST` | `/api/auth/logout` | End the current session |
| `POST` | `/api/domains/check` | Check domains from JSON `{ "names": ["example.fr"] }` |
| `POST` | `/api/domains/check/csv` | Upload CSV (`multipart/form-data`, field `file`) |

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
