CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  name varchar(40) NOT NULL, abbreviation varchar(10) NOT NULL, decimal_allowed boolean NOT NULL DEFAULT false,
  UNIQUE(tenant_id,name), UNIQUE(tenant_id,abbreviation)
);
ALTER TABLE products ADD COLUMN unit_id uuid REFERENCES units(id);
ALTER TABLE products ADD COLUMN description varchar(500);

CREATE TABLE product_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), product_id uuid NOT NULL REFERENCES products(id),
  batch_code varchar(60), quantity numeric(12,3) NOT NULL CHECK(quantity >= 0), expires_at date,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,product_id,batch_code)
);
CREATE INDEX batches_expiration ON product_batches(tenant_id,expires_at) WHERE quantity > 0;

CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), supplier_id uuid NOT NULL REFERENCES suppliers(id),
  user_id uuid NOT NULL REFERENCES users(id), number bigint GENERATED ALWAYS AS IDENTITY, issued_at date NOT NULL DEFAULT current_date,
  expected_at date, received_at timestamptz, subtotal numeric(12,2) NOT NULL DEFAULT 0, discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0, status varchar(20) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','ordered','received','cancelled')),
  notes varchar(500), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id), quantity numeric(12,3) NOT NULL CHECK(quantity > 0),
  unit_cost numeric(12,2) NOT NULL CHECK(unit_cost >= 0), total numeric(12,2) NOT NULL CHECK(total >= 0), UNIQUE(purchase_id,product_id)
);
CREATE INDEX purchases_tenant_date ON purchases(tenant_id,created_at DESC);

CREATE TABLE cash_registers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), opened_by uuid NOT NULL REFERENCES users(id),
  closed_by uuid REFERENCES users(id), opening_amount numeric(12,2) NOT NULL CHECK(opening_amount >= 0), expected_amount numeric(12,2),
  closing_amount numeric(12,2), difference numeric(12,2), opened_at timestamptz NOT NULL DEFAULT now(), closed_at timestamptz,
  status varchar(10) NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed'))
);
CREATE UNIQUE INDEX one_open_cash_per_tenant ON cash_registers(tenant_id) WHERE status='open';
ALTER TABLE sales ADD COLUMN cash_register_id uuid REFERENCES cash_registers(id);

CREATE TABLE financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), name varchar(80) NOT NULL,
  type varchar(10) NOT NULL CHECK(type IN ('income','expense')), system boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true,
  UNIQUE(tenant_id,name,type)
);
CREATE TABLE financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), category_id uuid NOT NULL REFERENCES financial_categories(id),
  created_by uuid NOT NULL REFERENCES users(id), type varchar(10) NOT NULL CHECK(type IN ('income','expense')),
  description varchar(240) NOT NULL, amount numeric(12,2) NOT NULL CHECK(amount > 0), due_at date NOT NULL,
  paid_at timestamptz, status varchar(15) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','cancelled')),
  reference_type varchar(30), reference_id uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX finance_tenant_due ON financial_entries(tenant_id,due_at,status);

CREATE TABLE cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), cash_register_id uuid NOT NULL REFERENCES cash_registers(id),
  user_id uuid NOT NULL REFERENCES users(id), type varchar(15) NOT NULL CHECK(type IN ('opening','sale','deposit','withdrawal','closing')),
  amount numeric(12,2) NOT NULL, description varchar(240) NOT NULL, reference_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), customer_id uuid NOT NULL REFERENCES customers(id),
  sale_id uuid REFERENCES sales(id), points integer NOT NULL, reason varchar(200) NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id), trade_name varchar(120), phone varchar(24), email varchar(254), address varchar(300),
  low_stock_notifications boolean NOT NULL DEFAULT true, loyalty_enabled boolean NOT NULL DEFAULT true,
  loyalty_points_per_real numeric(8,2) NOT NULL DEFAULT 1 CHECK(loyalty_points_per_real >= 0), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid REFERENCES users(id),
  title varchar(140) NOT NULL, message varchar(500) NOT NULL, type varchar(30) NOT NULL DEFAULT 'info', read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_date ON notifications(tenant_id,user_id,created_at DESC);

INSERT INTO units(tenant_id,name,abbreviation,decimal_allowed)
SELECT id,'Unidade','un',false FROM tenants ON CONFLICT DO NOTHING;
UPDATE products p SET unit_id=(SELECT u.id FROM units u WHERE u.tenant_id=p.tenant_id AND u.abbreviation='un' LIMIT 1) WHERE unit_id IS NULL;
ALTER TABLE products ALTER COLUMN unit_id SET NOT NULL;
INSERT INTO tenant_settings(tenant_id,trade_name) SELECT id,name FROM tenants ON CONFLICT DO NOTHING;
INSERT INTO financial_categories(tenant_id,name,type,system)
SELECT id,'Vendas','income',true FROM tenants UNION ALL SELECT id,'Compras','expense',true FROM tenants
ON CONFLICT DO NOTHING;
