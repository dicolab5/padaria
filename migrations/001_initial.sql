CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(120) NOT NULL, cnpj varchar(18), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), name varchar(120) NOT NULL,
  email varchar(254) NOT NULL, password_hash text NOT NULL, role varchar(20) NOT NULL CHECK (role IN ('admin','gerente','caixa','estoque')),
  active boolean NOT NULL DEFAULT true, failed_attempts smallint NOT NULL DEFAULT 0, locked_until timestamptz, last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (tenant_id,email)
);
CREATE UNIQUE INDEX users_email_ci ON users(lower(email));
CREATE TABLE categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), name varchar(80) NOT NULL, description varchar(300), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,name));
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), category_id uuid REFERENCES categories(id), name varchar(140) NOT NULL,
  barcode varchar(32), price numeric(12,2) NOT NULL CHECK(price >= 0), cost numeric(12,2) NOT NULL DEFAULT 0 CHECK(cost >= 0), stock numeric(12,3) NOT NULL DEFAULT 0,
  minimum_stock numeric(12,3) NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, image_url text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,barcode)
);
CREATE TABLE customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), name varchar(140) NOT NULL, phone varchar(24), email varchar(254), document varchar(20), loyalty_points integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE suppliers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), name varchar(140) NOT NULL, document varchar(20), contact_name varchar(120), phone varchar(24), email varchar(254), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE sales (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), customer_id uuid REFERENCES customers(id), user_id uuid NOT NULL REFERENCES users(id), number bigint GENERATED ALWAYS AS IDENTITY, subtotal numeric(12,2) NOT NULL, discount numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL, payment_method varchar(20) NOT NULL CHECK(payment_method IN ('cash','pix','debit','credit')), status varchar(20) NOT NULL DEFAULT 'completed' CHECK(status IN ('completed','cancelled')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE sale_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sale_id uuid NOT NULL REFERENCES sales(id), product_id uuid NOT NULL REFERENCES products(id), quantity numeric(12,3) NOT NULL CHECK(quantity > 0), unit_price numeric(12,2) NOT NULL CHECK(unit_price >= 0), unit_cost numeric(12,2) NOT NULL CHECK(unit_cost >= 0), total numeric(12,2) NOT NULL CHECK(total >= 0));
CREATE TABLE stock_movements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), product_id uuid NOT NULL REFERENCES products(id), user_id uuid NOT NULL REFERENCES users(id), type varchar(20) NOT NULL CHECK(type IN ('entry','sale','loss','adjustment')), quantity numeric(12,3) NOT NULL, reason varchar(240), reference_id uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_logs (id bigserial PRIMARY KEY, tenant_id uuid REFERENCES tenants(id), user_id uuid REFERENCES users(id), action varchar(80) NOT NULL, entity varchar(60), entity_id uuid, ip inet, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX products_tenant_name ON products(tenant_id,name); CREATE INDEX sales_tenant_date ON sales(tenant_id,created_at DESC); CREATE INDEX stock_tenant_product ON stock_movements(tenant_id,product_id,created_at DESC); CREATE INDEX audit_tenant_date ON audit_logs(tenant_id,created_at DESC);
