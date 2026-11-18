ALTER TABLE tenants ADD COLUMN subscription_ends_at timestamptz;

CREATE INDEX tenants_subscription_expiration
  ON tenants(subscription_status,subscription_ends_at)
  WHERE subscription_status='active' AND subscription_ends_at IS NOT NULL;
