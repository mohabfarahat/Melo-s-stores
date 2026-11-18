/*
# Run the admin check with the caller's own permissions

1. Changed Function
- `is_admin()` now runs with the signed-in caller's permissions instead of the database owner's.

2. Security
- It still answers only "is the signed-in account an admin", because the `admins` table lets each account read only its own row.
- Visitors (not signed in) can no longer run this check.

3. Notes
- Behavior for admins and customers is unchanged.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
