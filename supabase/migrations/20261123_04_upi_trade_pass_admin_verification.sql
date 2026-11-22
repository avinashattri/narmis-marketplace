-- ====================================================================
-- NARMIS  |  Migration 4  |  UPI QR Trade Pass + Admin Verification
-- --------------------------------------------------------------------
-- INCREMENTAL MIGRATION (preserves all previous migrations & data)
--   * Replaces Razorpay gateway flow with manual UPI QR payment
--     submission (₹299 / 365 days) and admin-only verification.
--   * Users submit their UPI transaction reference via
--     public.submit_trade_subscription_payment(), stored with status
--     'Pending Verification'. Subscriptions are NEVER activated on submit.
--   * Admins (listed in public.admin_users) view pending submissions via
--     public.admin_list_subscription_payments() and approve/reject via
--     public.admin_review_subscription_payment().
--   * Approval activates/extends the annual Trade Pass by exactly 365 days.
--   * Rejection records the rejection reason and does NOT activate access.
--   * Enforced strictly via PostgreSQL RLS and SECURITY DEFINER functions.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Admin Users Table (only service_role / SQL Editor can grant admin)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notes      TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users check own admin membership" ON public.admin_users;
CREATE POLICY "Users check own admin membership" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL    ON public.admin_users TO service_role;

-- Internal + client-callable admin check helper
CREATE OR REPLACE FUNCTION public.is_narmis_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_narmis_admin();
$$;

-- --------------------------------------------------------------------
-- 2. Extend public.subscription_payments incrementally for UPI QR review
-- --------------------------------------------------------------------
ALTER TABLE public.subscription_payments
  ADD COLUMN IF NOT EXISTS upi_reference       TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'Pending Verification',
  ADD COLUMN IF NOT EXISTS reviewed_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason    TEXT;

ALTER TABLE public.subscription_payments
  ALTER COLUMN provider SET DEFAULT 'upi_qr';

ALTER TABLE public.subscription_payments
  DROP CONSTRAINT IF EXISTS subscription_payments_status_check;
ALTER TABLE public.subscription_payments
  ADD CONSTRAINT subscription_payments_status_check
  CHECK (status IN ('created', 'pending_verification', 'paid', 'approved', 'rejected', 'failed', 'refunded'));

ALTER TABLE public.subscription_payments
  DROP CONSTRAINT IF EXISTS subscription_payments_verification_status_check;
ALTER TABLE public.subscription_payments
  ADD CONSTRAINT subscription_payments_verification_status_check
  CHECK (verification_status IN ('Pending Verification', 'Approved', 'Rejected'));

-- Prevent submitting the same UPI UTR / reference twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_unique_upi_ref
  ON public.subscription_payments (lower(trim(upi_reference)))
  WHERE upi_reference IS NOT NULL AND trim(upi_reference) <> '';

CREATE INDEX IF NOT EXISTS idx_subscription_payments_verification_status
  ON public.subscription_payments (verification_status, created_at DESC);

-- Admins may read all subscription payment rows; regular users only see their own
DROP POLICY IF EXISTS "Admins read all subscription payments" ON public.subscription_payments;
CREATE POLICY "Admins read all subscription payments" ON public.subscription_payments
  FOR SELECT USING (public.is_narmis_admin());

-- Keep direct client writes strictly revoked (all mutations go through RPCs)
REVOKE INSERT, UPDATE, DELETE ON public.subscription_payments FROM PUBLIC, anon, authenticated;

-- --------------------------------------------------------------------
-- 3. User RPC: submit UPI QR payment reference (always Pending Verification)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_trade_subscription_payment(
  p_upi_reference text
)
RETURNS public.subscription_payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid       uuid := auth.uid();
  clean_ref text := trim(COALESCE(p_upi_reference, ''));
  order_ref text;
  inserted  public.subscription_payments%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: please sign in before submitting a payment.' USING ERRCODE = '28000';
  END IF;

  IF length(clean_ref) < 6 OR length(clean_ref) > 80 THEN
    RAISE EXCEPTION 'INVALID_UPI_REFERENCE: please enter a valid UPI transaction reference / UTR (6 to 80 characters).';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscription_payments
     WHERE lower(trim(upi_reference)) = lower(clean_ref)
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_UPI_REFERENCE: this UPI transaction reference has already been submitted.';
  END IF;

  order_ref := 'NRM-PASS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  INSERT INTO public.subscription_payments (
    user_id,
    plan,
    amount_paise,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    upi_reference,
    status,
    verification_status
  ) VALUES (
    uid,
    'trade_annual',
    29900,
    'INR',
    'upi_qr',
    order_ref,
    clean_ref,
    clean_ref,
    'pending_verification',
    'Pending Verification'
  )
  RETURNING * INTO inserted;

  -- Notice: trade_subscriptions is NOT modified here. Activation occurs only after admin approval.
  RETURN inserted;
END;
$$;

-- --------------------------------------------------------------------
-- 4. Admin RPC: list subscription payment submissions (admin-only)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_subscription_payments(
  p_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_json jsonb;
BEGIN
  IF NOT public.is_narmis_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED: administrator privileges are required to view payment submissions.'
      USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',                  sp.id,
        'user_id',             sp.user_id,
        'user_name',           COALESCE(p.full_name, split_part(u.email, '@', 1), 'Marketplace Member'),
        'user_email',          u.email,
        'college_name',        p.college_name,
        'plan',                sp.plan,
        'amount_paise',        sp.amount_paise,
        'currency',            sp.currency,
        'provider',            sp.provider,
        'provider_order_id',   sp.provider_order_id,
        'upi_reference',       COALESCE(sp.upi_reference, sp.provider_payment_id),
        'status',              sp.status,
        'verification_status', sp.verification_status,
        'rejection_reason',    sp.rejection_reason,
        'period_start',        sp.period_start,
        'period_end',          sp.period_end,
        'paid_at',             sp.paid_at,
        'reviewed_at',         sp.reviewed_at,
        'created_at',          sp.created_at
      )
      ORDER BY
        CASE WHEN sp.verification_status = 'Pending Verification' THEN 0 ELSE 1 END,
        sp.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO rows_json
  FROM public.subscription_payments sp
  LEFT JOIN public.profiles p ON p.id = sp.user_id
  LEFT JOIN auth.users u      ON u.id = sp.user_id
  WHERE p_status IS NULL OR sp.verification_status = p_status;

  RETURN rows_json;
END;
$$;

-- --------------------------------------------------------------------
-- 5. Admin RPC: approve (activates 365 days) or reject a submission
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_review_subscription_payment(
  p_payment_id       uuid,
  p_decision         text,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uid uuid := auth.uid();
  pay       public.subscription_payments%ROWTYPE;
  base_ts   timestamptz;
  new_exp   timestamptz;
  decision  text := lower(trim(COALESCE(p_decision, '')));
BEGIN
  IF NOT public.is_narmis_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED: administrator privileges are required to review subscription payments.'
      USING ERRCODE = '42501';
  END IF;

  IF decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'INVALID_DECISION: decision must be approve or reject.';
  END IF;

  SELECT * INTO pay FROM public.subscription_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND: subscription payment record does not exist.';
  END IF;
  IF pay.user_id IS NULL THEN
    RAISE EXCEPTION 'PAYMENT_HAS_NO_USER: cannot review a payment without an associated user.';
  END IF;

  IF pay.verification_status = 'Approved' OR pay.status = 'paid' THEN
    RAISE EXCEPTION 'ALREADY_APPROVED: this payment has already been approved and applied.';
  END IF;

  IF decision = 'approve' THEN
    INSERT INTO public.trade_subscriptions (user_id)
    VALUES (pay.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT GREATEST(now(), COALESCE(subscription_expires_at, now()))
      INTO base_ts
      FROM public.trade_subscriptions
     WHERE user_id = pay.user_id
     FOR UPDATE;

    new_exp := base_ts + interval '365 days';

    UPDATE public.trade_subscriptions
       SET subscription_expires_at = new_exp,
           updated_at = now()
     WHERE user_id = pay.user_id;

    UPDATE public.subscription_payments
       SET status = 'paid',
           verification_status = 'Approved',
           paid_at = now(),
           period_start = base_ts,
           period_end = new_exp,
           reviewed_by = admin_uid,
           reviewed_at = now(),
           rejection_reason = NULL
     WHERE id = p_payment_id;

    RETURN jsonb_build_object(
      'payment_id',              p_payment_id,
      'user_id',                 pay.user_id,
      'verification_status',     'Approved',
      'subscription_expires_at', new_exp
    );
  ELSE
    UPDATE public.subscription_payments
       SET status = 'rejected',
           verification_status = 'Rejected',
           reviewed_by = admin_uid,
           reviewed_at = now(),
           rejection_reason = NULLIF(trim(COALESCE(p_rejection_reason, '')), '')
     WHERE id = p_payment_id;

    -- Rejection explicitly does NOT modify trade_subscriptions
    RETURN jsonb_build_object(
      'payment_id',              p_payment_id,
      'user_id',                 pay.user_id,
      'verification_status',     'Rejected',
      'subscription_expires_at', NULL
    );
  END IF;
END;
$$;

-- --------------------------------------------------------------------
-- 6. Function execute privileges (strict least privilege)
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_narmis_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_narmis_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_trade_subscription_payment(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_trade_subscription_payment(text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_subscription_payments(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_subscription_payments(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_review_subscription_payment(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_subscription_payment(uuid, text, text) TO authenticated, service_role;

-- --------------------------------------------------------------------
-- 7. Realtime publication for subscription_payments
-- --------------------------------------------------------------------
DO $rt$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'subscription_payments'
     )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_payments;
  END IF;
END
$rt$;
