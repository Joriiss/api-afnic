import { config } from '../config.js';
import { requestAccessTokenFromEnv } from '../auth/tokenService.js';
import type { AfnicDomainCheckResponse } from './types.js';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let envTokenCache: TokenCache | null = null;

async function getEnvAccessToken(): Promise<string> {
  if (envTokenCache && Date.now() < envTokenCache.expiresAt) {
    return envTokenCache.accessToken;
  }

  const token = await requestAccessTokenFromEnv();
  envTokenCache = {
    accessToken: token.accessToken,
    expiresAt: token.expiresAt - 30_000,
  };

  return envTokenCache.accessToken;
}

export function clearEnvTokenCache(): void {
  envTokenCache = null;
}

function mockCheck(names: string[]): AfnicDomainCheckResponse {
  return {
    response: names.map((name) => {
      const label = name.replace(/\.fr$/i, '').toLowerCase();
      const unavailable =
        label.includes('taken') ||
        label === 'example' ||
        label === 'nic' ||
        label.startsWith('reserved');

      return {
        name,
        available: !unavailable,
        reason: unavailable ? ('IN_USE' as const) : undefined,
      };
    }),
  };
}

async function callDomainCheck(
  names: string[],
  accessToken: string,
): Promise<AfnicDomainCheckResponse> {
  const response = await fetch(`${config.afnicApiBaseUrl}/v1/domains/check`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ names }),
  });

  if (response.status === 401) {
    throw Object.assign(new Error('AFNIC token expired or invalid'), { status: 401 });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AFNIC domain check failed (${response.status}): ${text}`);
  }

  return (await response.json()) as AfnicDomainCheckResponse;
}

export async function checkDomainsWithAfnic(
  names: string[],
  accessToken?: string,
): Promise<AfnicDomainCheckResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockCheck(names);
  }

  const token = accessToken ?? (await getEnvAccessToken());

  return callDomainCheck(names, token);
}
