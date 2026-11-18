/*
# Add private owner invite code table

1. New Table
- `owner_invite_codes`: holds the single secret code that lets someone create a store owner account.

2. Security
- Enable RLS with no policies, so visitors and signed-in users cannot read or change the code.
- Only the server function (service role) can read it.

3. Notes
- The code itself is added separately, not in this migration, so it is never stored in the project files.
*/

CREATE TABLE IF NOT EXISTS owner_invite_codes (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  code text NOT NULL CHECK (length(code) >= 16),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE owner_invite_codes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON owner_invite_codes TO service_role;
