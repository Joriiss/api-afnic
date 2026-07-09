import { checkDomainsWithAfnic } from '../afnic/client.js';
import type { DomainCheckResponse, DomainCheckResult } from '../afnic/types.js';
import { config } from '../config.js';
import type { NormalizedDomain, InvalidDomain } from '../utils/normalizeDomains.js';

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function invalidToResults(invalid: InvalidDomain[]): DomainCheckResult[] {
  return invalid.map((item) => ({
    name: item.input,
    available: null,
    error: item.error,
    sourceRow: item.sourceRow,
  }));
}

async function checkChunk(
  domains: NormalizedDomain[],
  accessToken?: string,
): Promise<DomainCheckResult[]> {
  const names = domains.map((domain) => domain.name);

  if (names.length > config.chunkSize) {
    throw new Error(
      `Lot interne trop grand (${names.length} domaines). Maximum AFNIC : ${config.chunkSize}.`,
    );
  }

  const afnicResponse = await checkDomainsWithAfnic(names, accessToken);
  const availabilityByName = new Map(
    (afnicResponse.response ?? []).map((item) => [item.name.toLowerCase(), item]),
  );

  return domains.map((domain) => {
    const availability = availabilityByName.get(domain.name.toLowerCase());

    if (!availability) {
      return {
        name: domain.name,
        available: null,
        error: 'Aucune réponse reçue pour ce domaine',
        sourceRow: domain.sourceRow,
      };
    }

    return {
      name: availability.name,
      available: availability.available,
      reason: availability.reason,
      sourceRow: domain.sourceRow,
    };
  });
}

export async function runDomainChecks(
  domains: NormalizedDomain[],
  invalid: InvalidDomain[] = [],
  accessToken?: string,
): Promise<DomainCheckResponse> {
  const chunks = chunkArray(domains, config.chunkSize);
  const results: DomainCheckResult[] = [...invalidToResults(invalid)];

  for (const chunk of chunks) {
    const chunkResults = await checkChunk(chunk, accessToken);
    results.push(...chunkResults);
  }

  const checked = results.filter((result) => result.available !== null && !result.error).length;
  const failed = results.filter((result) => result.error).length;

  return {
    results,
    meta: {
      requested: domains.length + invalid.length,
      checked,
      failed,
      invalid: invalid.length,
    },
  };
}
