import { randomUUID } from 'node:crypto';
import { pool } from '../db/pool.js';
import type { AfnicEnvironment } from '../config/environments.js';

export interface StoredDomainRegistration {
  id: string;
  userId: string;
  domainName: string;
  authInfo: string;
  registrantClientId: string;
  adminContactClientId: string;
  durationYears: number;
  afnicEnvironment: AfnicEnvironment;
  afnicCreationDate?: string;
  afnicExpirationDate?: string;
  createdAt: string;
}

interface RegistrationRow {
  id: string;
  user_id: string;
  domain_name: string;
  auth_info: string;
  registrant_client_id: string;
  admin_contact_client_id: string;
  duration_years: number;
  afnic_environment: AfnicEnvironment;
  afnic_creation_date: Date | null;
  afnic_expiration_date: Date | null;
  created_at: Date;
}

function mapRow(row: RegistrationRow): StoredDomainRegistration {
  return {
    id: row.id,
    userId: row.user_id,
    domainName: row.domain_name,
    authInfo: row.auth_info,
    registrantClientId: row.registrant_client_id,
    adminContactClientId: row.admin_contact_client_id,
    durationYears: row.duration_years,
    afnicEnvironment: row.afnic_environment,
    afnicCreationDate: row.afnic_creation_date?.toISOString(),
    afnicExpirationDate: row.afnic_expiration_date?.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

export async function saveDomainRegistration(input: {
  userId: string;
  domainName: string;
  authInfo: string;
  registrantClientId: string;
  adminContactClientId: string;
  durationYears: number;
  afnicEnvironment: AfnicEnvironment;
  afnicCreationDate?: string;
  afnicExpirationDate?: string;
}): Promise<StoredDomainRegistration> {
  const result = await pool.query<RegistrationRow>(
    `INSERT INTO domain_registrations (
      id, user_id, domain_name, auth_info, registrant_client_id, admin_contact_client_id,
      duration_years, afnic_environment, afnic_creation_date, afnic_expiration_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      randomUUID(),
      input.userId,
      input.domainName,
      input.authInfo,
      input.registrantClientId,
      input.adminContactClientId,
      input.durationYears,
      input.afnicEnvironment,
      input.afnicCreationDate ?? null,
      input.afnicExpirationDate ?? null,
    ],
  );

  return mapRow(result.rows[0]);
}

export async function listDomainRegistrationsByUserId(
  userId: string,
): Promise<StoredDomainRegistration[]> {
  const result = await pool.query<RegistrationRow>(
    `SELECT * FROM domain_registrations
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map(mapRow);
}
