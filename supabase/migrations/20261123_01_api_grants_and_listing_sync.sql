-- ====================================================================
-- NARMIS  |  Migration 1 of 3  |  API grants + cross-device listing sync
-- --------------------------------------------------------------------
-- ROOT CAUSE FIXED HERE
--   The public tables existed and had RLS policies, but the Supabase API
--   roles (anon / authenticated) had NO table privileges, so every request
--   failed with  42501 "permission denied for table ..."  BEFORE RLS was even
--   evaluated. Listings therefore never reached the database from the app and
--   never became visible on other devices.
--
-- SAFETY
--   * Purely additive / idempotent. Nothing is dropped or truncated.
--   * Existing users, listings, messages, purchases are untouched.
--   * Least privilege: row access is still governed by the RLS policies.
--     Private tables (college_verifications, purchases, messages, ...) get NO
--     privileges for the anonymous role.
--
-- RUN ORDER: after the 5 existing migrations, then 02, then 03.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Schema usage
-- --------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 2. Table privileges (guarded: skips tables that do not exist)
-- --------------------------------------------------------------------
DO $grants$
DECLARE
  g record;
BEGIN
  FOR g IN
    SELECT * FROM (VALUES
      -- public marketplace data: visitors may read; RLS limits which rows
      ('profiles',              'SELECT',                  'anon, authenticated'),
      ('listings',              'SELECT',                  'anon, authenticated'),
      ('listing_images',        'SELECT',                  'anon, authenticated'),
      ('reviews',               'SELECT',                  'anon, authenticated'),
      ('community_requests',    'SELECT',                  'anon, authenticated'),
      -- signed-in users: writes are further restricted per-row by RLS
      ('profiles',              'INSERT, UPDATE',          'authenticated'),
      ('listings',              'INSERT, UPDATE, DELETE',  'authenticated'),
      ('listing_images',        'INSERT, UPDATE, DELETE',  'authenticated'),
      ('saved_listings',        'SELECT, INSERT, DELETE',  'authenticated'),
      ('rental_requests',       'SELECT, INSERT, UPDATE',  'authenticated'),
      ('trade_offers',          'SELECT, INSERT, UPDATE',  'authenticated'),
      ('conversations',         'SELECT, INSERT, UPDATE',  'authenticated'),
      ('messages',              'SELECT, INSERT, UPDATE',  'authenticated'),
      ('purchases',             'SELECT, INSERT, UPDATE',  'authenticated'),
      ('reviews',               'INSERT',                  'authenticated'),
      ('community_requests',    'INSERT, UPDATE, DELETE',  'authenticated'),
      ('college_verifications', 'SELECT, INSERT, UPDATE',  'authenticated'),
      ('terms_acceptances',     'SELECT, INSERT',          'authenticated')
    ) AS t(tbl, privs, roles)
  LOOP
    IF to_regclass('public.' || g.tbl) IS NOT NULL THEN
      EXECUTE format('GRANT %s ON public.%I TO %s', g.privs, g.tbl, g.roles);
    END IF;
  END LOOP;
END
$grants$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- --------------------------------------------------------------------
-- 3. Every auth user must have a profile row (listings.user_id -> profiles.id)
--    Back-fills accounts created before the signup trigger existed.
--    INSERT only; never overwrites an existing profile.
-- --------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, avatar_url, bio, location, college_name, college_verification_status)
SELECT
  u.id,
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(u.email, '@', 1), 'Marketplace Member'),
  COALESCE(u.raw_user_meta_data->>'avatar_url',
           'https://ui-avatars.com/api/?name=' || replace(COALESCE(split_part(u.email, '@', 1), 'Member'), ' ', '+') ||
           '&background=304943&color=EAD3AA&bold=true&size=150'),
  COALESCE(u.raw_user_meta_data->>'bio', 'Member of NARMIS circular community.'),
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'location'), ''), 'Chitkara University, Rajpura, Punjab, India'),
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'college_name'), ''), 'Chitkara University, Punjab'),
  'Not Submitted'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- --------------------------------------------------------------------
-- 4. listing_images: only readable when the parent listing is readable.
--    (Previously USING (true) exposed images of inactive/private listings.)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Listing images viewable by everyone" ON public.listing_images;
DROP POLICY IF EXISTS "Listing images follow listing visibility" ON public.listing_images;
CREATE POLICY "Listing images follow listing visibility" ON public.listing_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_images.listing_id)
  );

-- --------------------------------------------------------------------
-- 5. Keep updated_at honest so clients can order/sync by it
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --------------------------------------------------------------------
-- 6. Indexes for the public feed and image joins
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing  ON public.listing_images (listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user     ON public.saved_listings (user_id);

-- --------------------------------------------------------------------
-- 7. Data-integrity constraints. NOT VALID => applies to new/updated rows
--    only, so existing data can never make this migration fail.
-- --------------------------------------------------------------------
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_prices_nonnegative;
ALTER TABLE public.listings ADD CONSTRAINT listings_prices_nonnegative CHECK (
  COALESCE(rental_price, 0)    >= 0 AND
  COALESCE(purchase_price, 0)  >= 0 AND
  COALESCE(estimated_value, 0) >= 0 AND
  COALESCE(original_mrp, 0)    >= 0
) NOT VALID;

-- --------------------------------------------------------------------
-- 8. Realtime: broadcast listing changes so other devices update live.
-- --------------------------------------------------------------------
DO $rt$
DECLARE
  t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['listings', 'listing_images'] LOOP
      IF to_regclass('public.' || t) IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
         )
      THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END
$rt$;
