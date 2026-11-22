-- ====================================================================
-- NARMIS - PRODUCT CONDITION, DAMAGE & ACCESSORIES DISCLOSURE
-- Extends existing tables only. No duplicate tables are created and no
-- existing listing data is overwritten (all new columns are nullable).
-- ====================================================================

-- 1. Wear & tear / defects, included items, packaging & documentation
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS defects TEXT[],               -- NULL = seller did not answer
  ADD COLUMN IF NOT EXISTS defect_other TEXT,
  ADD COLUMN IF NOT EXISTS defect_description TEXT,
  ADD COLUMN IF NOT EXISTS included_items TEXT[],
  ADD COLUMN IF NOT EXISTS included_custom TEXT,
  ADD COLUMN IF NOT EXISTS missing_accessories TEXT,
  ADD COLUMN IF NOT EXISTS packaging_available BOOLEAN,   -- NULL = not specified
  ADD COLUMN IF NOT EXISTS warranty_valid BOOLEAN,        -- NULL = not specified
  ADD COLUMN IF NOT EXISTS documentation_notes TEXT;

-- invoice_available previously defaulted to false, which made "not specified" look like "no".
ALTER TABLE public.listings ALTER COLUMN invoice_available DROP DEFAULT;

-- Validate defect values
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_defects_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_defects_check CHECK (
  defects IS NULL OR defects <@ ARRAY[
    'No visible damage','Minor scratches','Major scratches','Dents or physical marks',
    'Cracks or broken parts','Functional issues','Other'
  ]::TEXT[]
);

-- "No visible damage" cannot be combined with an actual defect
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_no_damage_exclusive;
ALTER TABLE public.listings ADD CONSTRAINT listings_no_damage_exclusive CHECK (
  defects IS NULL OR NOT ('No visible damage' = ANY(defects)) OR array_length(defects, 1) = 1
);

-- Length limits on free text (defence against abuse)
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_condition_text_length;
ALTER TABLE public.listings ADD CONSTRAINT listings_condition_text_length CHECK (
  coalesce(length(defect_other), 0) <= 300 AND
  coalesce(length(defect_description), 0) <= 2000 AND
  coalesce(length(included_custom), 0) <= 500 AND
  coalesce(length(missing_accessories), 0) <= 500 AND
  coalesce(length(documentation_notes), 0) <= 1000
);

-- 2. Condition photos reuse the existing listing_images table with an image_type column
ALTER TABLE public.listing_images
  ADD COLUMN IF NOT EXISTS image_type TEXT NOT NULL DEFAULT 'product';

ALTER TABLE public.listing_images DROP CONSTRAINT IF EXISTS listing_images_type_check;
ALTER TABLE public.listing_images ADD CONSTRAINT listing_images_type_check
  CHECK (image_type IN ('product', 'condition'));

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_type
  ON public.listing_images(listing_id, image_type);

-- 3. RLS: only the listing owner may modify listings and their images.
-- Replace the previous FOR ALL policy with explicit, owner-checked policies.
DROP POLICY IF EXISTS "Owners can manage listing images" ON public.listing_images;

CREATE POLICY "Owners insert listing images" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid())
  );
CREATE POLICY "Owners update listing images" ON public.listing_images
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid())
  );
CREATE POLICY "Owners delete listing images" ON public.listing_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid())
  );

-- Prevent an owner from re-assigning a listing to another user on update
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Storage: listing photos may only be written inside the uploader's own folder
--    (path format: <user_id>/<product|condition>/<file>), and only images <= 8 MB.
UPDATE storage.buckets
  SET file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
  WHERE id IN ('listings', 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Users upload listing images to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Private bucket for invoices (never public). Only the uploader can read/write.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', false, 8388608, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Owners manage own invoices" ON storage.objects
  FOR ALL USING (
    bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]
  );
