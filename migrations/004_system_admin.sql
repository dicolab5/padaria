ALTER TABLE tenants ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE tenants ADD COLUMN plan varchar(30) NOT NULL DEFAULT 'professional';

CREATE TABLE system_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL,
  password_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  failed_attempts smallint NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX system_admin_email_ci ON system_admins(lower(email));

CREATE TABLE system_audit_logs (
  id bigserial PRIMARY KEY,
  system_admin_id uuid REFERENCES system_admins(id),
  action varchar(80) NOT NULL,
  entity varchar(60),
  entity_id uuid,
  ip inet,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX system_audit_date ON system_audit_logs(created_at DESC);
