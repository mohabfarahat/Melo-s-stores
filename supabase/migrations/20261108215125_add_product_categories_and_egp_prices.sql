/*
# Add product categories, color families, and Egyptian pound prices

1. Modified Table
- `products` gets two new columns:
  - `category`: Cardholders, Wallets, or Small Leather Goods. Used for the shop navigation.
  - `color_family`: Rich Brown, Stone Grey, or Black. Used for the color filter.

2. Sample Data
- The four sample card holders get a category, a color family, and prices in Egyptian pounds (EGP).
- Prices are stored in piastres (1 EGP = 100), so 2,400 EGP is stored as 240000.

3. Security
- No new access rules. The existing visitor and admin rules cover the new columns.

4. Notes
- Existing rows get safe defaults first, then the sample rows are updated by their fixed ids, so re-running this migration is safe.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Cardholders';
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_family text NOT NULL DEFAULT 'Rich Brown';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_category_check
      CHECK (category IN ('Cardholders', 'Wallets', 'Small Leather Goods'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_color_family_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_color_family_check
      CHECK (color_family IN ('Rich Brown', 'Stone Grey', 'Black'));
  END IF;
END $$;

UPDATE products SET category = 'Cardholders', color_family = 'Rich Brown', price_cents = 240000
  WHERE id = '11111111-0000-4000-8000-000000000001';
UPDATE products SET category = 'Wallets', color_family = 'Rich Brown', price_cents = 480000
  WHERE id = '11111111-0000-4000-8000-000000000002';
UPDATE products SET category = 'Cardholders', color_family = 'Stone Grey', price_cents = 390000
  WHERE id = '11111111-0000-4000-8000-000000000003';
UPDATE products SET category = 'Wallets', color_family = 'Black', price_cents = 290000
  WHERE id = '11111111-0000-4000-8000-000000000004';
