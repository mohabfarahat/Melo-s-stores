/*
# Create shop tables (products, orders, order items)

1. New Tables
- `products`: the items sold in the shop (name, description, price in cents, photo, active flag).
- `orders`: one row per customer checkout (customer name, email, phone, shipping address, status, total).
- `order_items`: the individual products inside each order, with the price at time of purchase.

2. Security
- Enable RLS on all three tables.
- Visitors (anon role) can READ only active products. They cannot change products.
- Orders and order items have no access for visitors. They are written only by the server order function, which uses the service role.
- Product changes are made by the store owner through the database dashboard.

3. Notes
- Prices are stored in cents to avoid rounding errors.
- Order items keep a copy of the product name and price so old orders do not change when products change.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL DEFAULT '',
  shipping_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO service_role;

DROP POLICY IF EXISTS "anon_select_active_products" ON products;
CREATE POLICY "anon_select_active_products" ON products FOR SELECT
TO anon, authenticated USING (active = true);
