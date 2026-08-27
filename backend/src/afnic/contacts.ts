import { config } from '../config.js';
import type {
  AfnicContactCreatePayload,
  AfnicContactCreateResponse,
  AfnicContactUpdatePayload,
  AfnicContactUpdateResponse,
} from './contactTypes.js';
import type { AfnicRuntime } from './runtime.js';
import { getAccessTokenForEnvironment } from './tokenCache.js';

function mockCreateContact(): AfnicContactCreateResponse {
  const suffix = Math.floor(Math.random() * 90_000 + 10_000);
  return {
    clientId: `CTC${suffix}`,
    creationDate: new Date().toISOString(),
  };
}

function mockUpdateContact(clientId: string): AfnicContactUpdateResponse {
  return {
    clientId,
    updateDate: new Date().toISOString(),
  };
}

export async function createContactWithAfnic(
  payload: AfnicContactCreatePayload,
  runtime: AfnicRuntime,
): Promise<AfnicContactCreateResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return mockCreateContact();
  }

  const accessToken = await getAccessTokenForEnvironment(runtime.environment);
  const response = await fetch(`${runtime.apiBaseUrl}/v1/contacts`, {
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

export async function updateContactWithAfnic(
  payload: AfnicContactUpdatePayload,
  runtime: AfnicRuntime,
): Promise<AfnicContactUpdateResponse> {
  if (config.mockAfnic) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return mockUpdateContact(payload.clientId);
  }

  const accessToken = await getAccessTokenForEnvironment(runtime.environment);
  const response = await fetch(`${runtime.apiBaseUrl}/v1/contacts`, {
    method: 'PATCH',
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
    throw new Error(`Échec de la mise à jour du contact AFNIC (${response.status}): ${text}`);
  }

  return (await response.json()) as AfnicContactUpdateResponse;
}
