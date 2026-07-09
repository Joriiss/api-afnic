export type DomainAvailabilityReason =
  | 'IN_USE'
  | 'CITY_NAME'
  | 'ZONE_UNKNOWN'
  | 'RESERVED_NAME'
  | 'FORBIDDEN_NAME'
  | 'ZONE_NOT_OPENED'
  | 'REGISTRY_RESERVED'
  | 'REGISTRY_FORBIDDEN'
  | 'REGISTRY_BAD_SYNTAX'
  | 'EXTENSION_NOT_ACTIVE'
  | 'ZONE_NOT_EXISTS'
  | 'PROTECTED_LABEL_SYNTAX'
  | 'REGISTRY_BAD_ACE_SYNTAX'
  | 'SUBJECT_TO_PRIOR_REVIEW'
  | 'PROTECTED_SUB_LEVEL_DOMAIN';

export interface AfnicDomainAvailability {
  name: string;
  available: boolean;
  reason?: DomainAvailabilityReason;
}

export interface AfnicDomainCheckResponse {
  response?: AfnicDomainAvailability[];
}

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
}

export interface DomainCheckResponse {
  results: DomainCheckResult[];
  meta: DomainCheckMeta;
}
