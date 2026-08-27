import type { MoralLegalStatus, RegisterUserInput, UpdateProfileInput } from '../users/types.js';

export function validateRegisterInput(body: unknown): RegisterUserInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Corps de requête invalide');
  }

  const data = body as Record<string, unknown>;
  const address = data.address;

  if (!address || typeof address !== 'object') {
    throw new Error('L’adresse postale est obligatoire');
  }

  const addressData = address as Record<string, unknown>;
  const contactKind = data.contactKind === 'moral' ? 'moral' : data.contactKind === 'physical' ? 'physical' : null;

  if (!contactKind) {
    throw new Error('Le type de contact doit être physical ou moral');
  }

  const email = String(data.email ?? '').trim().toLowerCase();
  const password = String(data.password ?? '');
  const contactName = String(data.contactName ?? '').trim();
  const firstName = String(data.firstName ?? '').trim();
  const organizationName = String(data.organizationName ?? '').trim();
  const phone = String(data.phone ?? '').trim();
  const contactEmail = String(data.contactEmail ?? email).trim().toLowerCase();
  const firstStreet = String(addressData.firstStreet ?? '').trim();
  const cityName = String(addressData.cityName ?? '').trim();
  const postalCode = String(addressData.postalCode ?? '').trim();
  const countryCode = String(addressData.countryCode ?? 'FR').trim().toUpperCase();
  const legalStatus = data.legalStatus as MoralLegalStatus | undefined;
  const sirenSiret = String(data.sirenSiret ?? '').trim();

  if (!email || !email.includes('@')) {
    throw new Error('Adresse e-mail invalide');
  }

  if (password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!contactName) {
    throw new Error('Le nom du contact est obligatoire');
  }

  if (contactKind === 'physical' && !firstName) {
    throw new Error('Le prénom est obligatoire pour un particulier');
  }

  if (contactKind === 'moral' && !legalStatus) {
    throw new Error('Le statut juridique est obligatoire pour une entreprise');
  }

  if (!phone) {
    throw new Error('Le numéro de téléphone est obligatoire');
  }

  if (!firstStreet || !cityName || !postalCode || !countryCode) {
    throw new Error('L’adresse postale est incomplète');
  }

  return {
    email,
    password,
    contactKind,
    contactName,
    firstName: firstName || undefined,
    organizationName: organizationName || undefined,
    legalStatus,
    sirenSiret: sirenSiret || undefined,
    phone,
    contactEmail,
    address: {
      firstStreet,
      secondStreet: String(addressData.secondStreet ?? '').trim() || undefined,
      complementaryStreet: String(addressData.complementaryStreet ?? '').trim() || undefined,
      cityName,
      postalCode,
      countryCode,
    },
  };
}

export function validateUpdateProfileInput(
  body: unknown,
  contactKind: 'physical' | 'moral',
): UpdateProfileInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Corps de requête invalide');
  }

  const data = body as Record<string, unknown>;
  const address = data.address;

  if (!address || typeof address !== 'object') {
    throw new Error('L’adresse postale est obligatoire');
  }

  const addressData = address as Record<string, unknown>;
  const contactName = String(data.contactName ?? '').trim();
  const firstName = String(data.firstName ?? '').trim();
  const organizationName = String(data.organizationName ?? '').trim();
  const phone = String(data.phone ?? '').trim();
  const contactEmail = String(data.contactEmail ?? '').trim().toLowerCase();
  const firstStreet = String(addressData.firstStreet ?? '').trim();
  const cityName = String(addressData.cityName ?? '').trim();
  const postalCode = String(addressData.postalCode ?? '').trim();
  const countryCode = String(addressData.countryCode ?? 'FR').trim().toUpperCase();
  const legalStatus = data.legalStatus as MoralLegalStatus | undefined;
  const sirenSiret = String(data.sirenSiret ?? '').trim();

  if (!contactName) {
    throw new Error('Le nom du contact est obligatoire');
  }

  if (contactKind === 'physical' && !firstName) {
    throw new Error('Le prénom est obligatoire pour un particulier');
  }

  if (contactKind === 'moral' && !legalStatus) {
    throw new Error('Le statut juridique est obligatoire pour une entreprise');
  }

  if (!phone) {
    throw new Error('Le numéro de téléphone est obligatoire');
  }

  if (!contactEmail || !contactEmail.includes('@')) {
    throw new Error('E-mail de contact invalide');
  }

  if (!firstStreet || !cityName || !postalCode || !countryCode) {
    throw new Error('L’adresse postale est incomplète');
  }

  return {
    contactName,
    firstName: contactKind === 'physical' ? firstName : undefined,
    organizationName: contactKind === 'moral' ? organizationName || undefined : undefined,
    legalStatus: contactKind === 'moral' ? legalStatus : undefined,
    sirenSiret: contactKind === 'moral' ? sirenSiret || undefined : undefined,
    phone,
    contactEmail,
    address: {
      firstStreet,
      secondStreet: String(addressData.secondStreet ?? '').trim() || undefined,
      complementaryStreet: String(addressData.complementaryStreet ?? '').trim() || undefined,
      cityName,
      postalCode,
      countryCode,
    },
  };
}
