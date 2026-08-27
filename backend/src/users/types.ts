export type ContactKind = 'physical' | 'moral';

export type MoralLegalStatus = 'COMPANY' | 'OTHER' | 'ASSOCIATION';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  contactKind: ContactKind;
  afnicClientId: string;
  contactName: string;
  firstName?: string;
  organizationName?: string;
  legalStatus?: MoralLegalStatus;
  sirenSiret?: string;
  phone: string;
  contactEmail: string;
  address: {
    firstStreet: string;
    secondStreet?: string;
    complementaryStreet?: string;
    cityName: string;
    postalCode: string;
    countryCode: string;
  };
  createdAt: string;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  contactKind: ContactKind;
  contactName: string;
  firstName?: string;
  organizationName?: string;
  legalStatus?: MoralLegalStatus;
  sirenSiret?: string;
  phone: string;
  contactEmail: string;
  address: {
    firstStreet: string;
    secondStreet?: string;
    complementaryStreet?: string;
    cityName: string;
    postalCode: string;
    countryCode: string;
  };
}

export interface PublicUserProfile {
  id: string;
  email: string;
  isAdmin: boolean;
  contactKind: ContactKind;
  afnicClientId: string;
  contactName: string;
  firstName?: string;
  organizationName?: string;
  legalStatus?: MoralLegalStatus;
  sirenSiret?: string;
  phone: string;
  contactEmail: string;
  address: {
    firstStreet: string;
    secondStreet?: string;
    complementaryStreet?: string;
    cityName: string;
    postalCode: string;
    countryCode: string;
  };
  createdAt: string;
}

export interface UpdateProfileInput {
  contactName: string;
  firstName?: string;
  organizationName?: string;
  legalStatus?: MoralLegalStatus;
  sirenSiret?: string;
  phone: string;
  contactEmail: string;
  address: {
    firstStreet: string;
    secondStreet?: string;
    complementaryStreet?: string;
    cityName: string;
    postalCode: string;
    countryCode: string;
  };
}
