import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PublicUserProfile, RegisterUserInput, StoredUser } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
const usersFile = path.join(dataDir, 'users.json');

interface UserDatabase {
  users: StoredUser[];
}

async function readDatabase(): Promise<UserDatabase> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(usersFile, 'utf-8');
    return JSON.parse(raw) as UserDatabase;
  } catch {
    return { users: [] };
  }
}

async function writeDatabase(database: UserDatabase): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(usersFile, JSON.stringify(database, null, 2), 'utf-8');
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
  const database = await readDatabase();
  const normalized = email.trim().toLowerCase();
  return database.users.find((user) => user.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const database = await readDatabase();
  return database.users.find((user) => user.id === id) ?? null;
}

export async function createUser(
  input: RegisterUserInput,
  passwordHash: string,
  afnicClientId: string,
): Promise<StoredUser> {
  const database = await readDatabase();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (database.users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Un compte existe déjà avec cette adresse e-mail');
  }

  const user: StoredUser = {
    id: randomUUID(),
    email: normalizedEmail,
    passwordHash,
    contactKind: input.contactKind,
    afnicClientId,
    contactName: input.contactName.trim(),
    firstName: input.firstName?.trim(),
    organizationName: input.organizationName?.trim(),
    legalStatus: input.legalStatus,
    sirenSiret: input.sirenSiret?.trim(),
    phone: input.phone.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    address: {
      firstStreet: input.address.firstStreet.trim(),
      secondStreet: input.address.secondStreet?.trim(),
      complementaryStreet: input.address.complementaryStreet?.trim(),
      cityName: input.address.cityName.trim(),
      postalCode: input.address.postalCode.trim(),
      countryCode: input.address.countryCode.trim().toUpperCase(),
    },
    createdAt: new Date().toISOString(),
  };

  database.users.push(user);
  await writeDatabase(database);

  return user;
}
