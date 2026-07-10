CREATE TABLE IF NOT EXISTS domain_registrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  domain_name TEXT NOT NULL,
  auth_info TEXT NOT NULL,
  registrant_client_id TEXT NOT NULL,
  admin_contact_client_id TEXT NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 1,
  afnic_environment TEXT NOT NULL,
  afnic_creation_date TIMESTAMPTZ,
  afnic_expiration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS domain_registrations_user_idx ON domain_registrations (user_id);
CREATE INDEX IF NOT EXISTS domain_registrations_domain_idx ON domain_registrations (domain_name);
