import { randomUUID } from 'node:crypto';
import { isAdminEmail } from '../auth/admin.js';
import { pool } from '../db/pool.js';
import type { PublicUserProfile, RegisterUserInput, StoredUser, UpdateProfileInput, ContactKind } from './types.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  is_admin: boolean;
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
    isAdmin: row.is_admin,
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
    isAdmin: user.isAdmin,
    contactKind: user.contactKind,
    afnicClientId: user.afnicClientId,
    contactName: user.contactName,
    firstName: user.firstName,
    organizationName: user.organizationName,
    legalStatus: user.legalStatus,
    sirenSiret: user.sirenSiret,
    phone: user.phone,
    contactEmail: user.contactEmail,
    address: user.address,
    createdAt: user.createdAt,
  };
}

export async function syncAdminStatus(user: StoredUser): Promise<StoredUser> {
  // ADMIN_EMAILS can only grant admin, never revoke DB privileges set in the UI.
  if (!isAdminEmail(user.email) || user.isAdmin) {
    return user;
  }

  const result = await pool.query<UserRow>(
    'UPDATE users SET is_admin = TRUE WHERE id = $1 RETURNING *',
    [user.id],
  );

  return mapRow(result.rows[0]);
}

export async function listUsers(): Promise<StoredUser[]> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM users ORDER BY created_at DESC',
  );

  return result.rows.map(mapRow);
}

export async function countAdmins(): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM users WHERE is_admin = TRUE',
  );

  return Number.parseInt(result.rows[0]?.count ?? '0', 10);
}

export async function setUserAdmin(userId: string, isAdmin: boolean): Promise<StoredUser> {
  const result = await pool.query<UserRow>(
    'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING *',
    [isAdmin, userId],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('Utilisateur introuvable');
  }

  return mapRow(row);
}

export async function deleteUserById(userId: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM domain_registrations WHERE user_id = $1', [userId]);
    const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      throw new Error('Utilisateur introuvable');
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
  const isAdmin = isAdminEmail(normalizedEmail);

  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (
        id, email, password_hash, is_admin, contact_kind, afnic_client_id, contact_name,
        first_name, organization_name, legal_status, siren_siret, phone, contact_email,
        address_first_street, address_second_street, address_complementary_street,
        address_city_name, address_postal_code, address_country_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19
      )
      RETURNING *`,
      [
        id,
        normalizedEmail,
        passwordHash,
        isAdmin,
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

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
  contactKind: ContactKind,
): Promise<StoredUser> {
  const result = await pool.query<UserRow>(
    `UPDATE users SET
      contact_name = $1,
      first_name = $2,
      organization_name = $3,
      legal_status = $4,
      siren_siret = $5,
      phone = $6,
      contact_email = $7,
      address_first_street = $8,
      address_second_street = $9,
      address_complementary_street = $10,
      address_city_name = $11,
      address_postal_code = $12,
      address_country_code = $13
    WHERE id = $14
    RETURNING *`,
    [
      input.contactName.trim(),
      contactKind === 'physical' ? (input.firstName?.trim() ?? null) : null,
      contactKind === 'moral' ? (input.organizationName?.trim() ?? null) : null,
      contactKind === 'moral' ? (input.legalStatus ?? null) : null,
      contactKind === 'moral' ? (input.sirenSiret?.trim() ?? null) : null,
      input.phone.trim(),
      input.contactEmail.trim().toLowerCase(),
      input.address.firstStreet.trim(),
      input.address.secondStreet?.trim() ?? null,
      input.address.complementaryStreet?.trim() ?? null,
      input.address.cityName.trim(),
      input.address.postalCode.trim(),
      input.address.countryCode.trim().toUpperCase(),
      userId,
    ],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('Utilisateur introuvable');
  }

  return mapRow(row);
}
