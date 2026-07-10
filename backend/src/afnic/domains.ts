import { config } from '../config.js';
import type { AfnicRuntime } from './runtime.js';
import { getAccessTokenForEnvironment } from './tokenCache.js';
import type { AfnicDomainCreatePayload, AfnicDomainCreateResponse } from './domainTypes.js';

function mockCreateDomain(name: string): AfnicDomainCreateResponse {
  const now = new Date();
  const expiration = new Date(now);
  expiration.setFullYear(expiration.getFullYear() + 1);

  return {
    name,
    creationDate: now.toISOString(),
    expirationDate: expiration.toISOString(),
  };
}

export async function createDomainWithAfnic(
  payload: AfnicDomainCreatePayload,
  runtime: AfnicRuntime,
): Promise<AfnicDomainCreateResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCreateDomain(payload.name);
  }

  const accessToken = await getAccessTokenForEnvironment(runtime.environment);
  const response = await fetch(`${runtime.apiBaseUrl}/v1/domains`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Échec de l'enregistrement du domaine (${response.status}): ${text}`);
  }

  return (await response.json()) as AfnicDomainCreateResponse;
}
