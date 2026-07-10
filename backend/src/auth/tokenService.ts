import { config } from '../config.js';
import { formatAuthError } from './errors.js';

export interface TokenRequestCredentials {
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresAt: number;
  expiresIn: number;
}

export const DEFAULT_AFNIC_CLIENT_ID = 'registrars-api-client';

export async function requestAccessToken(
  credentials: TokenRequestCredentials,
  tokenUrl: string = config.keycloakTokenUrl,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: credentials.clientId || config.keycloakClientId || DEFAULT_AFNIC_CLIENT_ID,
    username: credentials.username,
    password: credentials.password,
  });

  const clientSecret = credentials.clientSecret || config.keycloakClientSecret;
  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(formatAuthError(response.status, text));
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function requestAccessTokenFromEnv(
  tokenUrl: string = config.keycloakTokenUrl,
): Promise<TokenResponse> {
  if (!config.keycloakUsername || !config.keycloakPassword) {
    throw new Error('Missing KEYCLOAK_USERNAME or KEYCLOAK_PASSWORD in environment');
  }

  return requestAccessToken(
    {
      username: config.keycloakUsername,
      password: config.keycloakPassword,
    },
    tokenUrl,
  );
}
