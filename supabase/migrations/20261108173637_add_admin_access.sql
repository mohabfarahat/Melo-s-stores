/*
# Add admin accounts and admin-only access to products and orders

1. New Tables
- `admins`: lists the sign-in accounts that count as store owners (one row per admin, linked to the account).

2. New Function
- `is_admin()`: returns true when the signed-in account is listed in `admins`. Uses the signed-in account only, never a value supplied by the caller.

3. Security
- Visitors (not signed in) still see only active products, and nothing else.
- Signed-in admins can read, add, edit, hide, and delete products.
- Signed-in admins can read orders and order items, and can change only an order's status.
- Signed-in users can see only their own row in `admins`, so they can check whether they are an admin. They cannot add themselves.
- Admin accounts are added by the store owner (database access), never from the website.

4. Order statuses
- Orders must be one of: pending, paid, shipped, cancelled.

5. Notes
- The customer checkout keeps working unchanged. It still runs through the secure order function.
*/

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON admins TO authenticated;

DROP POLICY IF EXISTS "select_own_admin_row" ON admins;
CREATE POLICY "select_own_admin_row" ON admins FOR SELECT
TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT UPDATE (status) ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;

DROP POLICY IF EXISTS "admin_select_all_products" ON products;
CREATE POLICY "admin_select_all_products" ON products FOR SELECT
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_order_status" ON orders;
CREATE POLICY "admin_update_order_status" ON orders FOR UPDATE
TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT
TO authenticated USING (public.is_admin());

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled'));
  END IF;
END $$;
