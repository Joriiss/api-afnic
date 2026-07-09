const REASON_LABELS: Record<string, string> = {
  IN_USE: 'Already registered',
  CITY_NAME: 'City name restriction',
  ZONE_UNKNOWN: 'Unknown zone',
  RESERVED_NAME: 'Reserved name',
  FORBIDDEN_NAME: 'Forbidden name',
  ZONE_NOT_OPENED: 'Zone not opened',
  REGISTRY_RESERVED: 'Registry reserved',
  REGISTRY_FORBIDDEN: 'Registry forbidden',
  REGISTRY_BAD_SYNTAX: 'Invalid syntax',
  EXTENSION_NOT_ACTIVE: 'Extension not active',
  ZONE_NOT_EXISTS: 'Zone does not exist',
  PROTECTED_LABEL_SYNTAX: 'Protected label syntax',
  REGISTRY_BAD_ACE_SYNTAX: 'Invalid ACE syntax',
  SUBJECT_TO_PRIOR_REVIEW: 'Subject to prior review',
  PROTECTED_SUB_LEVEL_DOMAIN: 'Protected sub-level domain',
};

export function humanizeReason(reason?: string): string {
  if (!reason) {
    return '';
  }

  return REASON_LABELS[reason] ?? reason;
}

export { REASON_LABELS };
