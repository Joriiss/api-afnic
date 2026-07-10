import type { AfnicContactCreatePayload } from '../afnic/contactTypes.js';
import { createContactWithAfnic } from '../afnic/contacts.js';
import { resolveAfnicRuntime } from '../afnic/runtime.js';
import { config } from '../config.js';
import type { RegisterUserInput } from '../users/types.js';

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (phone.startsWith('+')) {
    const countryCode = digits.slice(0, 2);
    const rest = digits.slice(2);
    return `+${countryCode}.${rest}`;
  }

  if (digits.startsWith('33')) {
    return `+33.${digits.slice(2)}`;
  }

  if (digits.startsWith('0')) {
    return `+33.${digits.slice(1)}`;
  }

  return `+33.${digits}`;
}

export function buildAfnicContactPayload(input: RegisterUserInput): AfnicContactCreatePayload {
  const payload: AfnicContactCreatePayload = {
    email: input.contactEmail,
    telephoneNumber: formatPhoneNumber(input.phone),
    localizedPostalInfo: {
      contactName: input.contactName,
      postalAddress: {
        firstStreet: input.address.firstStreet,
        cityName: input.address.cityName,
        postalCode: input.address.postalCode,
        countryCode: input.address.countryCode,
      },
    },
    extensions: {
      frnic: {
        eligibilityVerified: true,
        reachable: {
          reachable: true,
          medium: 'EMAIL',
        },
      },
    },
  };

  if (input.address.secondStreet) {
    payload.localizedPostalInfo.postalAddress.secondStreet = input.address.secondStreet;
  }

  if (input.address.complementaryStreet) {
    payload.localizedPostalInfo.postalAddress.complementaryStreet = input.address.complementaryStreet;
  }

  if (input.organizationName) {
    payload.localizedPostalInfo.organizationName = input.organizationName;
  }

  if (input.contactKind === 'physical') {
    payload.extensions.frnic.physical = {
      firstName: input.firstName ?? input.contactName,
    };
  } else {
    payload.extensions.frnic.moral = {
      legalStatus: input.legalStatus ?? 'OTHER',
      sirenSiret: input.sirenSiret,
    };
  }

  return payload;
}

export async function registerContactWithAfnic(input: RegisterUserInput): Promise<string> {
  const payload = buildAfnicContactPayload(input);
  const runtime = resolveAfnicRuntime(config.afnicEnvironment);
  const response = await createContactWithAfnic(payload, runtime);

  if (!response.clientId) {
    throw new Error('AFNIC n’a pas renvoyé d’identifiant de contact');
  }

  return response.clientId;
}
