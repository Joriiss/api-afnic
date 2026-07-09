import Papa from 'papaparse';
import { normalizeDomainNames } from './normalizeDomains.js';

const DOMAIN_HEADER_CANDIDATES = new Set(['domain', 'name', 'domain_name', 'domainname', 'fqdn']);

export interface ParsedCsvDomains {
  domains: ReturnType<typeof normalizeDomainNames>['valid'];
  invalid: ReturnType<typeof normalizeDomainNames>['invalid'];
  totalRows: number;
}

function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/)[0] ?? '';
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function findDomainColumn(headers: string[]): number {
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());

  for (let index = 0; index < normalizedHeaders.length; index += 1) {
    if (DOMAIN_HEADER_CANDIDATES.has(normalizedHeaders[index])) {
      return index;
    }
  }

  return 0;
}

export function parseDomainsFromCsv(content: string): ParsedCsvDomains {
  const delimiter = detectDelimiter(content);
  const parsed = Papa.parse<string[]>(content, {
    delimiter,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? 'Failed to parse CSV file');
  }

  const rows = parsed.data.filter((row) => row.some((cell) => cell?.trim()));
  if (rows.length === 0) {
    return { domains: [], invalid: [], totalRows: 0 };
  }

  const [headerRow, ...dataRows] = rows;
  const hasHeader = headerRow.some((cell) =>
    DOMAIN_HEADER_CANDIDATES.has(cell.trim().toLowerCase()),
  );

  const domainColumn = hasHeader ? findDomainColumn(headerRow) : 0;
  const bodyRows = hasHeader ? dataRows : rows;

  const inputs: string[] = [];
  const sourceRows: number[] = [];

  bodyRows.forEach((row, index) => {
    const value = row[domainColumn]?.trim();
    if (!value) {
      return;
    }

    inputs.push(value);
    sourceRows.push(index + (hasHeader ? 2 : 1));
  });

  const normalized = normalizeDomainNames(inputs, { sourceRows });

  return {
    domains: normalized.valid,
    invalid: normalized.invalid,
    totalRows: bodyRows.length,
  };
}
