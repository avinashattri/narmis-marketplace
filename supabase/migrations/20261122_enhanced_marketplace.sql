-- ====================================================================
-- NARMIS P2P MARKETPLACE - ENHANCED SCHEMA MIGRATION
-- Adds structured product fields, condition options, location fields,
-- terms acceptance tracking, and strengthened security policies.
-- ====================================================================

-- 1. Update listings table with enhanced structured product description fields
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model_name TEXT,
  ADD COLUMN IF NOT EXISTS product_age TEXT,
  ADD COLUMN IF NOT EXISTS purchase_date DATE,
  ADD COLUMN IF NOT EXISTS original_mrp NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS accessories_included TEXT,
  ADD COLUMN IF NOT EXISTS warranty_status TEXT,
  ADD COLUMN IF NOT EXISTS invoice_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT 'v1.0';

-- Update condition check to include 'Needs Repair'
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_condition_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_condition_check
  CHECK (condition IN ('Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'Needs Repair'));

-- Update category check to include 'Fashion & Apparel'
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_category_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_category_check
  CHECK (category IN (
    'Electronics',
    'Computers and Accessories',
    'Books',
    'Tools and Equipment',
    'Photography',
    'Gaming',
    'Sports Equipment',
    'Cricket Equipment',
    'Fashion & Apparel',
    'Furniture',
    'Other'
  ));

-- 2. Update rental_requests with terms acceptance tracking
ALTER TABLE public.rental_requests
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT 'v1.0';

-- 3. Update trade_offers with negotiation status and terms
ALTER TABLE public.trade_offers DROP CONSTRAINT IF EXISTS trade_offers_status_check;
ALTER TABLE public.trade_offers ADD CONSTRAINT trade_offers_status_check
  CHECK (status IN ('pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'));

ALTER TABLE public.trade_offers
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 4. Reviews table integrity & anti-fraud constraints
-- Prevent reviewing own profile
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_no_self_review;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_no_self_review
  CHECK (reviewer_id <> target_user_id);

-- Prevent duplicate reviews for the same listing by the same reviewer
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_listing_reviewer
  ON public.reviews(reviewer_id, listing_id)
  WHERE listing_id IS NOT NULL;

-- 5. Terms acceptance records table for legal compliance audit log
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  terms_type TEXT NOT NULL CHECK (terms_type IN ('listing_creation', 'rental_agreement', 'trade_agreement', 'account_signup')),
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  reference_id UUID, -- listing_id, rental_request_id, etc.
  ip_address TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own terms acceptance" ON public.terms_acceptances;
CREATE POLICY "Users can view their own terms acceptance" ON public.terms_acceptances
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record terms acceptance" ON public.terms_acceptances;
CREATE POLICY "Users can record terms acceptance" ON public.terms_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Storage Buckets for Avatars and Listing Images
-- Set up Storage Policies (if Supabase Storage extension is active)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read, authenticated user write for their own folder
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Public listing images access" ON storage.objects;
CREATE POLICY "Public listing images access" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND auth.role() = 'authenticated'
  );
