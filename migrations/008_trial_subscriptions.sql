ALTER TABLE tenants
  ADD COLUMN subscription_status varchar(20) NOT NULL DEFAULT 'active'
    CHECK(subscription_status IN ('trial','active','past_due','cancelled')),
  ADD COLUMN trial_started_at timestamptz,
  ADD COLUMN trial_ends_at timestamptz;

CREATE INDEX tenants_trial_expiration
  ON tenants(subscription_status,trial_ends_at)
  WHERE subscription_status='trial';
