import { randomUUID } from 'node:crypto';
import { pool } from '../db/pool.js';
import type { PublicUserProfile, RegisterUserInput, StoredUser } from './types.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  contact_kind: 'physical' | 'moral';
  afnic_client_id: string;
  contact_name: string;
  first_name: string | null;
  organization_name: string | null;
  legal_status: string | null;
  siren_siret: string | null;
  phone: string;
  contact_email: string;
  address_first_street: string;
  address_second_street: string | null;
  address_complementary_street: string | null;
  address_city_name: string;
  address_postal_code: string;
  address_country_code: string;
  created_at: Date;
}

function mapRow(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    contactKind: row.contact_kind,
    afnicClientId: row.afnic_client_id,
    contactName: row.contact_name,
    firstName: row.first_name ?? undefined,
    organizationName: row.organization_name ?? undefined,
    legalStatus: (row.legal_status as StoredUser['legalStatus']) ?? undefined,
    sirenSiret: row.siren_siret ?? undefined,
    phone: row.phone,
    contactEmail: row.contact_email,
    address: {
      firstStreet: row.address_first_street,
      secondStreet: row.address_second_street ?? undefined,
      complementaryStreet: row.address_complementary_street ?? undefined,
      cityName: row.address_city_name,
      postalCode: row.address_postal_code,
      countryCode: row.address_country_code,
    },
    createdAt: row.created_at.toISOString(),
  };
}

export function toPublicProfile(user: StoredUser): PublicUserProfile {
  return {
    id: user.id,
    email: user.email,
    contactKind: user.contactKind,
    afnicClientId: user.afnicClientId,
    contactName: user.contactName,
    firstName: user.firstName,
    organizationName: user.organizationName,
    createdAt: user.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [normalized]);
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function createUser(
  input: RegisterUserInput,
  passwordHash: string,
  afnicClientId: string,
): Promise<StoredUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const id = randomUUID();

  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (
        id, email, password_hash, contact_kind, afnic_client_id, contact_name,
        first_name, organization_name, legal_status, siren_siret, phone, contact_email,
        address_first_street, address_second_street, address_complementary_street,
        address_city_name, address_postal_code, address_country_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18
      )
      RETURNING *`,
      [
        id,
        normalizedEmail,
        passwordHash,
        input.contactKind,
        afnicClientId,
        input.contactName.trim(),
        input.firstName?.trim() ?? null,
        input.organizationName?.trim() ?? null,
        input.legalStatus ?? null,
        input.sirenSiret?.trim() ?? null,
        input.phone.trim(),
        input.contactEmail.trim().toLowerCase(),
        input.address.firstStreet.trim(),
        input.address.secondStreet?.trim() ?? null,
        input.address.complementaryStreet?.trim() ?? null,
        input.address.cityName.trim(),
        input.address.postalCode.trim(),
        input.address.countryCode.trim().toUpperCase(),
      ],
    );

    return mapRow(result.rows[0]);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw new Error('Un compte existe déjà avec cette adresse e-mail');
    }

    throw error;
  }
}
