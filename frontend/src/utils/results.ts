const REASON_LABELS: Record<string, string> = {
  IN_USE: 'Déjà enregistré',
  CITY_NAME: 'Nom de ville réservé',
  ZONE_UNKNOWN: 'Zone inconnue',
  RESERVED_NAME: 'Nom réservé',
  FORBIDDEN_NAME: 'Nom interdit',
  ZONE_NOT_OPENED: 'Zone non ouverte',
  REGISTRY_RESERVED: 'Réservé par le registre',
  REGISTRY_FORBIDDEN: 'Interdit par le registre',
  REGISTRY_BAD_SYNTAX: 'Syntaxe invalide',
  EXTENSION_NOT_ACTIVE: 'Extension inactive',
  ZONE_NOT_EXISTS: 'Zone inexistante',
  PROTECTED_LABEL_SYNTAX: 'Syntaxe de label protégée',
  REGISTRY_BAD_ACE_SYNTAX: 'Syntaxe ACE invalide',
  SUBJECT_TO_PRIOR_REVIEW: 'Soumis à examen préalable',
  PROTECTED_SUB_LEVEL_DOMAIN: 'Sous-domaine protégé',
};

export function humanizeReason(reason?: string): string {
  if (!reason) {
    return '';
  }

  return REASON_LABELS[reason] ?? reason;
}

export function getDomainRegisterUrl(extranetBaseUrl: string, domain: string): string {
  const base = extranetBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ searchQuery: domain });
  return `${base}/en/search?${params.toString()}`;
}

export function formatAvailability(available: boolean | null): string {
  if (available === null) {
    return 'Erreur';
  }

  return available ? 'Oui' : 'Non';
}

export function exportResultsToCsv(
  results: Array<{
    name: string;
    available: boolean | null;
    reason?: string;
    sourceRow?: number;
    error?: string;
  }>,
): string {
  const header = ['domaine', 'disponible', 'raison', 'ligne', 'erreur'];
  const rows = results.map((result) => [
    result.name,
    formatAvailability(result.available),
    humanizeReason(result.reason),
    result.sourceRow?.toString() ?? '',
    result.error ?? '',
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
