import type { AfnicEnvironment } from '../config/environments.js';
import { requestAccessToken } from '../auth/tokenService.js';
import { getRegistrarCredentials } from './runtime.js';
import { resolveAfnicRuntime } from './runtime.js';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

const tokenCaches = new Map<AfnicEnvironment, TokenCache>();

export async function getAccessTokenForEnvironment(environment: AfnicEnvironment): Promise<string> {
  const cached = tokenCaches.get(environment);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.accessToken;
  }

  const runtime = resolveAfnicRuntime(environment);
  const credentials = getRegistrarCredentials(environment);

  if (!credentials.username || !credentials.password) {
    throw new Error(
      `Identifiants registrar manquants pour l'environnement ${runtime.environmentLabel}`,
    );
  }

  const token = await requestAccessToken(
    {
      username: credentials.username,
      password: credentials.password,
    },
    runtime.tokenUrl,
  );

  tokenCaches.set(environment, {
    accessToken: token.accessToken,
    expiresAt: token.expiresAt - 30_000,
  });

  return token.accessToken;
}

export function clearTokenCaches(): void {
  tokenCaches.clear();
}
