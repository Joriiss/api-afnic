import { config } from '../config.js';

const DOMAIN_LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export interface NormalizedDomain {
  name: string;
  sourceRow?: number;
}

export interface InvalidDomain {
  input: string;
  sourceRow?: number;
  error: string;
}

export interface NormalizeResult {
  valid: NormalizedDomain[];
  invalid: InvalidDomain[];
}

function splitInput(value: string): string[] {
  return value
    .split(/[\n,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeSingleDomain(raw: string, autoAppendFr: boolean): { name?: string; error?: string } {
  let value = raw.trim().toLowerCase();

  if (!value) {
    return { error: 'Nom de domaine vide' };
  }

  if (!value.includes('.') && autoAppendFr) {
    value = `${value}.fr`;
  }

  if (!value.endsWith('.fr')) {
    return { error: 'Seuls les domaines .fr sont pris en charge' };
  }

  const label = value.slice(0, -3);

  if (!label || !DOMAIN_LABEL_REGEX.test(label)) {
    return { error: 'Syntaxe du nom de domaine invalide' };
  }

  return { name: value };
}

export function normalizeDomainNames(
  inputs: string[],
  options?: { sourceRows?: number[]; autoAppendFr?: boolean },
): NormalizeResult {
  const autoAppendFr = options?.autoAppendFr ?? config.autoAppendFrSuffix;
  const valid: NormalizedDomain[] = [];
  const invalid: InvalidDomain[] = [];
  const seen = new Set<string>();

  inputs.forEach((input, index) => {
    const parts = splitInput(input);
    const sourceRow = options?.sourceRows?.[index];

    for (const part of parts) {
      const { name, error } = normalizeSingleDomain(part, autoAppendFr);

      if (error || !name) {
        invalid.push({ input: part, sourceRow, error: error ?? 'Domaine invalide' });
        continue;
      }

      if (seen.has(name)) {
        continue;
      }

      seen.add(name);
      valid.push({ name, sourceRow });
    }
  });

  return { valid, invalid };
}

export function parseDomainListFromText(text: string): NormalizeResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  return normalizeDomainNames(lines);
}
