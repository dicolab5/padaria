ALTER TABLE sales DROP CONSTRAINT sales_payment_method_check;
ALTER TABLE sales ADD CONSTRAINT sales_payment_method_check CHECK(payment_method IN ('cash','pix','debit','credit','store_credit'));

CREATE TABLE customer_receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  sale_id uuid NOT NULL UNIQUE REFERENCES sales(id),
  original_amount numeric(12,2) NOT NULL CHECK(original_amount > 0),
  paid_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(paid_amount >= 0),
  due_at date NOT NULL,
  status varchar(15) NOT NULL DEFAULT 'open' CHECK(status IN ('open','partial','paid','cancelled')),
  notes varchar(300),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(paid_amount <= original_amount)
);
CREATE INDEX receivables_tenant_due ON customer_receivables(tenant_id,status,due_at);
CREATE INDEX receivables_customer ON customer_receivables(tenant_id,customer_id,created_at DESC);

CREATE TABLE customer_credit_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  receivable_id uuid NOT NULL REFERENCES customer_receivables(id),
  user_id uuid NOT NULL REFERENCES users(id),
  amount numeric(12,2) NOT NULL CHECK(amount > 0),
  payment_method varchar(20) NOT NULL CHECK(payment_method IN ('cash','pix','debit','credit')),
  notes varchar(240),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_payments_receivable ON customer_credit_payments(receivable_id,created_at DESC);
