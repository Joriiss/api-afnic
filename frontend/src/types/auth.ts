export type ContactKind = 'physical' | 'moral';

export type MoralLegalStatus = 'COMPANY' | 'OTHER' | 'ASSOCIATION';

export interface RegisterRequest {
  email: string;
  password: string;
  contactKind: ContactKind;
  contactName: string;
  firstName?: string;
  organizationName?: string;
  legalStatus?: MoralLegalStatus;
  sirenSiret?: string;
  phone: string;
  contactEmail?: string;
  address: {
    firstStreet: string;
    secondStreet?: string;
    complementaryStreet?: string;
    cityName: string;
    postalCode: string;
    countryCode: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  isAdmin: boolean;
  contactKind: ContactKind;
  afnicClientId: string;
  contactName: string;
  firstName?: string;
  organizationName?: string;
  createdAt: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  email?: string;
  contactName?: string;
  firstName?: string;
  afnicClientId?: string;
  isAdmin?: boolean;
  mockAfnic: boolean;
  environment?: 'sandbox' | 'production';
  environmentLabel?: string;
  extranetBaseUrl?: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: UserProfile;
  isAdmin?: boolean;
  mockAfnic: boolean;
  environment?: 'sandbox' | 'production';
  environmentLabel?: string;
  extranetBaseUrl?: string;
}
