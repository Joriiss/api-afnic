import { config } from '../config.js';
import { requestAccessTokenFromEnv } from '../auth/tokenService.js';
import type { AfnicContactCreatePayload, AfnicContactCreateResponse } from './contactTypes.js';

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

function mockCreateContact(): AfnicContactCreateResponse {
  const suffix = Math.floor(Math.random() * 90_000 + 10_000);
  return {
    clientId: `CTC${suffix}`,
    creationDate: new Date().toISOString(),
  };
}

export async function createContactWithAfnic(
  payload: AfnicContactCreatePayload,
): Promise<AfnicContactCreateResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return mockCreateContact();
  }

  const accessToken = await getEnvAccessToken();
  const response = await fetch(`${config.afnicApiBaseUrl}/v1/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Extensions: 'FRNIC_V2',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Échec de la création du contact AFNIC (${response.status}): ${text}`);
  }

  return (await response.json()) as AfnicContactCreateResponse;
}
