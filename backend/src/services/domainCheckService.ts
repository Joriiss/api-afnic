import { checkDomainsWithAfnic } from '../afnic/client.js';
import type { AfnicRuntime } from '../afnic/runtime.js';
import type { DomainCheckResponse, DomainCheckResult } from '../afnic/types.js';
import { config } from '../config.js';
import type { NormalizedDomain, InvalidDomain } from '../utils/normalizeDomains.js';

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunkSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 1;
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
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
  runtime: AfnicRuntime,
): Promise<DomainCheckResult[]> {
  const names = domains.map((domain) => domain.name);

  if (names.length > config.chunkSize) {
    throw new Error(
      `Lot interne trop grand (${names.length} domaines). Maximum AFNIC : ${config.chunkSize}.`,
    );
  }

  const afnicResponse = await checkDomainsWithAfnic(names, runtime);
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
  runtime: AfnicRuntime,
): Promise<DomainCheckResponse> {
  const chunks = chunkArray(domains, config.chunkSize);
  const results: DomainCheckResult[] = [...invalidToResults(invalid)];

  for (const chunk of chunks) {
    const chunkResults = await checkChunk(chunk, runtime);
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
