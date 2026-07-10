import { config } from '../config.js';
import type { AfnicRuntime } from './runtime.js';
import { getAccessTokenForEnvironment } from './tokenCache.js';
import type { AfnicDomainCheckResponse } from './types.js';

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
  runtime: AfnicRuntime,
  accessToken: string,
): Promise<AfnicDomainCheckResponse> {
  const response = await fetch(`${runtime.apiBaseUrl}/v1/domains/check`, {
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
  runtime: AfnicRuntime,
): Promise<AfnicDomainCheckResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockCheck(names);
  }

  const token = await getAccessTokenForEnvironment(runtime.environment);
  return callDomainCheck(names, runtime, token);
}
