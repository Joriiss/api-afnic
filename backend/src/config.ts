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

export const AFNIC_MAX_DOMAIN_CHECK = 7;

export const config = {
  afnicEnvironment,
  afnicEnvironmentLabel: environmentProfile.label,
  port: Number(process.env.PORT ?? 3001),
  afnicApiBaseUrl: process.env.AFNIC_API_BASE_URL ?? environmentProfile.apiBaseUrl,
  keycloakTokenUrl: process.env.KEYCLOAK_TOKEN_URL ?? environmentProfile.tokenUrl,
  extranetBaseUrl: process.env.EXTRANET_BASE_URL ?? environmentProfile.extranetBaseUrl,
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID ?? 'registrars-api-client',
  keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
  keycloakUsername: process.env.KEYCLOAK_USERNAME ?? '',
  keycloakPassword: process.env.KEYCLOAK_PASSWORD ?? '',
  mockAfnic: process.env.MOCK_AFNIC === 'true',
  chunkSize: Math.min(
    Number(process.env.DOMAIN_CHECK_CHUNK_SIZE ?? AFNIC_MAX_DOMAIN_CHECK),
    AFNIC_MAX_DOMAIN_CHECK,
  ),
  autoAppendFrSuffix: process.env.AUTO_APPEND_FR_SUFFIX !== 'false',
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-session-secret-change-me',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
};

export type { AfnicEnvironment };
