ALTER TABLE customers
  ADD COLUMN credit_pin_hash text,
  ADD COLUMN credit_pin_failed_attempts smallint NOT NULL DEFAULT 0 CHECK(credit_pin_failed_attempts >= 0),
  ADD COLUMN credit_pin_locked_until timestamptz;

COMMENT ON COLUMN customers.credit_pin_hash IS 'Hash scrypt do PIN de seis dígitos usado para autorizar compras no crediário.';
