ALTER TABLE customers
  ADD COLUMN credit_limit numeric(12,2) NOT NULL DEFAULT 0 CHECK(credit_limit >= 0),
  ADD COLUMN portal_password_hash text,
  ADD COLUMN portal_active boolean NOT NULL DEFAULT false,
  ADD COLUMN portal_failed_attempts smallint NOT NULL DEFAULT 0,
  ADD COLUMN portal_locked_until timestamptz,
  ADD COLUMN portal_last_login_at timestamptz;

ALTER TABLE tenants ADD COLUMN portal_code varchar(20);
UPDATE tenants SET portal_code=upper(left(replace(id::text,'-',''),8)) WHERE portal_code IS NULL;
ALTER TABLE tenants ALTER COLUMN portal_code SET NOT NULL;
CREATE UNIQUE INDEX tenants_portal_code_ci ON tenants(lower(portal_code));
CREATE UNIQUE INDEX customers_portal_email_ci ON customers(tenant_id,lower(email)) WHERE email IS NOT NULL AND portal_active;
