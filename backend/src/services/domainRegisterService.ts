import { createDomainWithAfnic } from '../afnic/domains.js';
import type { AfnicRuntime } from '../afnic/runtime.js';
import { config } from '../config.js';
import { saveDomainRegistration } from '../registrations/store.js';
import { generateAuthInfo } from '../utils/authInfo.js';
import { normalizeDomainNames } from '../utils/normalizeDomains.js';

export interface RegisterDomainInput {
  userId: string;
  domain: string;
  registrantClientId: string;
  runtime: AfnicRuntime;
}

export interface RegisterDomainResult {
  domain: string;
  authInfo: string;
  registrantClientId: string;
  adminContactClientId: string;
  durationYears: number;
  environment: string;
  creationDate?: string;
  expirationDate?: string;
}

export async function registerDomainForUser(
  input: RegisterDomainInput,
): Promise<RegisterDomainResult> {
  const normalized = normalizeDomainNames([input.domain]);

  if (normalized.valid.length !== 1) {
    throw new Error(normalized.invalid[0]?.error ?? 'Nom de domaine invalide');
  }

  const domainName = normalized.valid[0]!.name;
  const authInfo = generateAuthInfo();
  const adminContactClientId = config.afnicDefaultAdminContactId;
  const durationYears = config.defaultDomainDurationYears;

  const afnicResponse = await createDomainWithAfnic(
    {
      name: domainName,
      authorizationInformation: authInfo,
      registrantClientId: input.registrantClientId,
      durationInYears: durationYears,
      contacts: [
        { clientId: adminContactClientId, role: 'ADMINISTRATIVE' },
        { clientId: adminContactClientId, role: 'TECHNICAL' },
      ],
    },
    input.runtime,
  );

  await saveDomainRegistration({
    userId: input.userId,
    domainName,
    authInfo,
    registrantClientId: input.registrantClientId,
    adminContactClientId,
    durationYears,
    afnicEnvironment: input.runtime.environment,
    afnicCreationDate: afnicResponse.creationDate,
    afnicExpirationDate: afnicResponse.expirationDate,
  });

  return {
    domain: afnicResponse.name ?? domainName,
    authInfo,
    registrantClientId: input.registrantClientId,
    adminContactClientId,
    durationYears,
    environment: input.runtime.environmentLabel,
    creationDate: afnicResponse.creationDate,
    expirationDate: afnicResponse.expirationDate,
  };
}
