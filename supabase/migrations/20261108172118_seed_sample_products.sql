/*
# Add sample card holder products

1. New Rows
- Four sample card holders in the `products` table, each with a photo, description, and price in cents.

2. Security
- No security changes. Products are readable by visitors through the existing policy.

3. Notes
- These are placeholder products. The store owner can edit or replace them in the database dashboard.
- Fixed ids are used so re-running this migration does not create duplicates.
*/

INSERT INTO products (id, name, description, price_cents, image_url, active) VALUES
  ('11111111-0000-4000-8000-000000000001', 'Classic Leather Card Holder', 'Slim handcrafted leather card holder with room for up to 6 cards and folded notes.', 2500, 'https://images.pexels.com/photos/12495666/pexels-photo-12495666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true),
  ('11111111-0000-4000-8000-000000000002', 'Brown Everyday Wallet', 'A roomy brown wallet with a zip pocket for coins, plus card slots and a cash section.', 3800, 'https://images.pexels.com/photos/36343443/pexels-photo-36343443.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true),
  ('11111111-0000-4000-8000-000000000003', 'Handmade Travel Cardholder', 'Hand-stitched travel cardholder with a map-inspired finish, perfect for trips.', 4500, 'https://images.pexels.com/photos/4452382/pexels-photo-4452382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true),
  ('11111111-0000-4000-8000-000000000004', 'Rustic Mini Card Wallet', 'Compact rustic card wallet that fits in any handbag or pocket.', 1800, 'https://images.pexels.com/photos/4452375/pexels-photo-4452375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true)
ON CONFLICT (id) DO NOTHING;
