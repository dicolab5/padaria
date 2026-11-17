CREATE INDEX IF NOT EXISTS sales_tenant_payment_date
  ON sales(tenant_id,payment_method,created_at DESC)
  WHERE status='completed';

CREATE INDEX IF NOT EXISTS sales_tenant_customer_date
  ON sales(tenant_id,customer_id,created_at DESC)
  WHERE status='completed';

CREATE INDEX IF NOT EXISTS sale_items_product_sale
  ON sale_items(product_id,sale_id);
