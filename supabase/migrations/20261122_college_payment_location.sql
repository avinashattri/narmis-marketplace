-- ====================================================================
-- NARMIS P2P MARKETPLACE - COLLEGE VERIFICATION, PAYMENT & LOCATION
-- Preserves existing user data, stores College IDs privately, enforces
-- server-side RLS, and updates default location to Chitkara University.
-- ====================================================================

-- 1. Safe public campus fields on public.profiles (never store raw ID docs here)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Chitkara University',
  ADD COLUMN IF NOT EXISTS college_verification_status TEXT DEFAULT 'Not Submitted',
  ADD COLUMN IF NOT EXISTS college_verified_at TIMESTAMPTZ;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_college_verification_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_college_verification_status_check
  CHECK (college_verification_status IN ('Not Submitted', 'Pending Verification', 'Verified', 'Rejected'));

-- Prevent regular authenticated users from self-approving verification status via direct profile updates
CREATE OR REPLACE FUNCTION public.protect_profile_verification_fields()
RETURNS trigger AS $$
BEGIN
  IF current_setting('role', true) = 'authenticated' THEN
    IF NEW.college_verification_status IS DISTINCT FROM OLD.college_verification_status
       AND NEW.college_verification_status = 'Verified' THEN
      RAISE EXCEPTION 'College verification status can only be marked Verified by an administrator.';
    END IF;
    IF NEW.college_verified_at IS DISTINCT FROM OLD.college_verified_at THEN
      NEW.college_verified_at := OLD.college_verified_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_verification ON public.profiles;
CREATE TRIGGER trg_protect_profile_verification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_verification_fields();

-- 2. Private College Verification Records Table (NEVER publicly readable)
CREATE TABLE IF NOT EXISTS public.college_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL DEFAULT 'Chitkara University',
  college_id_number TEXT NOT NULL,
  college_id_image_path TEXT, -- Private path in storage bucket 'college-ids'
  verification_status TEXT NOT NULL DEFAULT 'Not Submitted'
    CHECK (verification_status IN ('Not Submitted', 'Pending Verification', 'Verified', 'Rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.college_verifications ENABLE ROW LEVEL SECURITY;

-- Only the document owner can view their own sensitive ID number / storage path
-- Future admins / Edge Functions use service_role (bypasses RLS)
DROP POLICY IF EXISTS "Users view own college verification" ON public.college_verifications;
CREATE POLICY "Users view own college verification" ON public.college_verifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users submit own college verification" ON public.college_verifications;
CREATE POLICY "Users submit own college verification" ON public.college_verifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND verification_status IN ('Not Submitted', 'Pending Verification')
  );

DROP POLICY IF EXISTS "Users update own unverified college submission" ON public.college_verifications;
CREATE POLICY "Users update own unverified college submission" ON public.college_verifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND verification_status IN ('Not Submitted', 'Pending Verification')
  );

-- Automatically sync safe summary fields to public.profiles when verification record changes
CREATE OR REPLACE FUNCTION public.sync_college_verification_to_profile()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET
    college_name = NEW.college_name,
    college_verification_status = NEW.verification_status,
    college_verified_at = CASE WHEN NEW.verification_status = 'Verified' THEN COALESCE(NEW.reviewed_at, NOW()) ELSE NULL END,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_college_verification ON public.college_verifications;
CREATE TRIGGER trg_sync_college_verification
  AFTER INSERT OR UPDATE ON public.college_verifications
  FOR EACH ROW EXECUTE PROCEDURE public.sync_college_verification_to_profile();

-- 3. Private Storage Bucket for College ID Documents (NEVER public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('college-ids', 'college-ids', false, 8388608, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 8388608;

DROP POLICY IF EXISTS "Owners view own college id image" ON storage.objects;
CREATE POLICY "Owners view own college id image" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'college-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners upload own college id image" ON storage.objects;
CREATE POLICY "Owners upload own college id image" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'college-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners update own college id image" ON storage.objects;
CREATE POLICY "Owners update own college id image" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'college-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners delete own college id image" ON storage.objects;
CREATE POLICY "Owners delete own college id image" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'college-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Update Signup Trigger for Default Campus Location (without overwriting user-entered locations)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    bio,
    location,
    college_name,
    college_verification_status
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id),
    COALESCE(new.raw_user_meta_data->>'bio', 'NARMIS marketplace member.'),
    COALESCE(NULLIF(trim(new.raw_user_meta_data->>'location'), ''), 'Chitkara University, Rajpura, Punjab, India'),
    COALESCE(NULLIF(trim(new.raw_user_meta_data->>'college_name'), ''), 'Chitkara University'),
    'Not Submitted'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update Purchases Table for UPI QR Payment & Honest Verification Tracking
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_confirmed_by_buyer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_verification_status TEXT DEFAULT 'Payment Submitted';

ALTER TABLE public.purchases ALTER COLUMN payment_method SET DEFAULT 'UPI_QR';

ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_status_check
  CHECK (status IN ('payment_submitted', 'pending', 'completed', 'refunded', 'cancelled'));

ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_verification_status_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_verification_status_check
  CHECK (payment_verification_status IN ('Awaiting Payment', 'Payment Submitted', 'Verified', 'Cancelled'));

DROP POLICY IF EXISTS "Buyers can record demo purchase" ON public.purchases;
DROP POLICY IF EXISTS "Buyers can record purchase payment" ON public.purchases;
CREATE POLICY "Buyers can record purchase payment" ON public.purchases
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND payment_verification_status IN ('Awaiting Payment', 'Payment Submitted')
  );

DROP POLICY IF EXISTS "Sellers can update payment verification status" ON public.purchases;
CREATE POLICY "Sellers can update payment verification status" ON public.purchases
  FOR UPDATE USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);
