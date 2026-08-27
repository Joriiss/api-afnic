export interface DomainCheckResult {
  name: string;
  available: boolean | null;
  reason?: string;
  sourceRow?: number;
  error?: string;
}

export interface DomainCheckMeta {
  requested: number;
  checked: number;
  failed: number;
  invalid: number;
  csvRows?: number;
}

export interface DomainCheckResponse {
  results: DomainCheckResult[];
  meta: DomainCheckMeta;
}

export interface DomainRegisterResponse {
  domain: string;
  authInfo: string;
  registrantClientId: string;
  adminContactClientId: string;
  durationYears: number;
  environment: string;
  creationDate?: string;
  expirationDate?: string;
}

export interface DomainRegistrationItem {
  id: string;
  domain: string;
  authInfo: string;
  durationYears: number;
  registeredAt: string;
  expirationDate?: string;
  status: 'active' | 'cancelled' | 'unknown';
}

export interface DomainRegistrationsResponse {
  registrations: DomainRegistrationItem[];
}

export interface HealthResponse {
  status: string;
  mockAfnic: boolean;
  environment: 'sandbox' | 'production';
  environmentLabel: string;
  afnicApiBaseUrl: string;
  keycloakTokenUrl: string;
  extranetBaseUrl: string;
}

export type {
  AdminUserItem,
  AdminUsersResponse,
  AuthResponse,
  AuthStatusResponse,
  ContactKind,
  MoralLegalStatus,
  RegisterRequest,
  UpdateProfileRequest,
  UserProfile,
} from './types/auth';
