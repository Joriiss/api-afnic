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
  AuthResponse,
  AuthStatusResponse,
  ContactKind,
  MoralLegalStatus,
  RegisterRequest,
  UserProfile,
} from './types/auth';
