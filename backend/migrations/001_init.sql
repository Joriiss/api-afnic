CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  contact_kind TEXT NOT NULL CHECK (contact_kind IN ('physical', 'moral')),
  afnic_client_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  first_name TEXT,
  organization_name TEXT,
  legal_status TEXT,
  siren_siret TEXT,
  phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  address_first_street TEXT NOT NULL,
  address_second_street TEXT,
  address_complementary_street TEXT,
  address_city_name TEXT NOT NULL,
  address_postal_code TEXT NOT NULL,
  address_country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
