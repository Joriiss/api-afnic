import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AFNIC_ENVIRONMENTS,
  resolveAfnicEnvironment,
  type AfnicEnvironment,
} from './config/environments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const afnicEnvironment = resolveAfnicEnvironment(process.env.AFNIC_ENV);
const environmentProfile = AFNIC_ENVIRONMENTS[afnicEnvironment];

function parseAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function parseEnvInt(
  value: string | undefined,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (options?.min !== undefined && parsed < options.min) {
    return fallback;
  }

  if (options?.max !== undefined && parsed > options.max) {
    return options.max;
  }

  return parsed;
}

export const AFNIC_MAX_DOMAIN_CHECK = 7;

export const config = {
  afnicEnvironment,
  afnicEnvironmentLabel: environmentProfile.label,
  port: parseEnvInt(process.env.PORT, 3001, { min: 1 }),
  afnicApiBaseUrl: process.env.AFNIC_API_BASE_URL ?? environmentProfile.apiBaseUrl,
  keycloakTokenUrl: process.env.KEYCLOAK_TOKEN_URL ?? environmentProfile.tokenUrl,
  extranetBaseUrl: process.env.EXTRANET_BASE_URL ?? environmentProfile.extranetBaseUrl,
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID ?? 'registrars-api-client',
  keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
  keycloakUsername: process.env.KEYCLOAK_USERNAME ?? '',
  keycloakPassword: process.env.KEYCLOAK_PASSWORD ?? '',
  mockAfnic: process.env.MOCK_AFNIC === 'true',
  chunkSize: Math.min(
    parseEnvInt(process.env.DOMAIN_CHECK_CHUNK_SIZE, AFNIC_MAX_DOMAIN_CHECK, { min: 1 }),
    AFNIC_MAX_DOMAIN_CHECK,
  ),
  autoAppendFrSuffix: process.env.AUTO_APPEND_FR_SUFFIX !== 'false',
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-session-secret-change-me',
  frontendOrigins: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://afnic:afnic@localhost:5432/afnic',
  adminEmails: parseAdminEmails(),
  afnicDefaultAdminContactId: process.env.AFNIC_DEFAULT_ADMIN_CONTACT_ID ?? 'CTC1607933',
  defaultDomainDurationYears: parseEnvInt(process.env.DEFAULT_DOMAIN_DURATION_YEARS, 1, { min: 1 }),
};

export type { AfnicEnvironment };
