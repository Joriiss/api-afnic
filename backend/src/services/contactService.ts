import type { AfnicContactCreatePayload, AfnicContactUpdatePayload } from '../afnic/contactTypes.js';
import { createContactWithAfnic, updateContactWithAfnic } from '../afnic/contacts.js';
import { resolveAfnicRuntime, type AfnicRuntime } from '../afnic/runtime.js';
import { config } from '../config.js';
import type { RegisterUserInput, StoredUser, UpdateProfileInput } from '../users/types.js';

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

export function buildAfnicContactUpdatePayload(
  clientId: string,
  input: UpdateProfileInput,
): AfnicContactUpdatePayload {
  const payload: AfnicContactUpdatePayload = {
    clientId,
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
  };

  if (input.address.secondStreet) {
    payload.localizedPostalInfo!.postalAddress.secondStreet = input.address.secondStreet;
  }

  if (input.address.complementaryStreet) {
    payload.localizedPostalInfo!.postalAddress.complementaryStreet = input.address.complementaryStreet;
  }

  if (input.organizationName) {
    payload.localizedPostalInfo!.organizationName = input.organizationName;
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

export async function syncContactProfileWithAfnic(
  user: StoredUser,
  input: UpdateProfileInput,
  runtime: AfnicRuntime,
): Promise<void> {
  const payload = buildAfnicContactUpdatePayload(user.afnicClientId, input);
  await updateContactWithAfnic(payload, runtime);
}
