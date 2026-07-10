import { resolveAfnicRuntime } from '../afnic/runtime.js';
import type { AfnicEnvironment } from '../config/environments.js';
import { config } from '../config.js';
import type { StoredDomainRegistration } from '../registrations/store.js';
import { runDomainChecks } from './domainCheckService.js';
import { normalizeDomainNames } from '../utils/normalizeDomains.js';

export type DomainRegistrationStatus = 'active' | 'cancelled' | 'unknown';

function groupByEnvironment(
  registrations: StoredDomainRegistration[],
): Map<AfnicEnvironment, StoredDomainRegistration[]> {
  const groups = new Map<AfnicEnvironment, StoredDomainRegistration[]>();

  for (const registration of registrations) {
    const current = groups.get(registration.afnicEnvironment) ?? [];
    current.push(registration);
    groups.set(registration.afnicEnvironment, current);
  }

  return groups;
}

function resolveStatusFromAvailability(available: boolean | null | undefined): DomainRegistrationStatus {
  if (available === true) {
    return 'cancelled';
  }

  if (available === false) {
    return 'active';
  }

  return 'unknown';
}

export async function resolveRegistrationStatuses(
  registrations: StoredDomainRegistration[],
): Promise<Map<string, DomainRegistrationStatus>> {
  const statusById = new Map<string, DomainRegistrationStatus>();

  if (registrations.length === 0) {
    return statusById;
  }

  if (config.mockAfnic) {
    for (const registration of registrations) {
      statusById.set(registration.id, 'active');
    }

    return statusById;
  }

  const groups = groupByEnvironment(registrations);

  for (const [environment, items] of groups) {
    const runtime = resolveAfnicRuntime(environment);
    const names = items.map((item) => item.domainName);
    const normalized = normalizeDomainNames(names);

    try {
      const checkResponse = await runDomainChecks(normalized.valid, normalized.invalid, runtime);
      const availabilityByName = new Map(
        checkResponse.results.map((result) => [result.name.toLowerCase(), result]),
      );

      for (const item of items) {
        const availability = availabilityByName.get(item.domainName.toLowerCase());
        statusById.set(item.id, resolveStatusFromAvailability(availability?.available));
      }
    } catch {
      for (const item of items) {
        statusById.set(item.id, 'unknown');
      }
    }
  }

  return statusById;
}
