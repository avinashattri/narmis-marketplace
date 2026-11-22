-- ====================================================================
-- NARMIS  |  Migration 2 of 3  |  Trade trials + ₹299 annual subscription
-- --------------------------------------------------------------------
-- DESIGN
--   * 3 free trade offers per USER ACCOUNT, stored in the database. Logging
--     out, clearing storage or switching device cannot reset them.
--   * After the free trials, a trade offer needs an active annual
--     subscription (₹299 / year).
--   * The ONLY way to create a trade offer is public.create_trade_offer().
--     It consumes a trial atomically (row lock) in the same transaction that
--     inserts the offer, so a failed insert never burns a trial and
--     concurrent requests cannot exceed the limit.
--   * Clients can NEVER write subscription state. Subscriptions are
--     activated only by public.activate_trade_subscription(), which is
--     executable by service_role alone (called from the payment webhook after
--     the gateway signature is verified).
--
-- KNOWN LIMIT (documented, not hidden): trials are per account. A person who
-- registers a brand-new account gets a new allowance. Mitigations (verified
-- college email / college ID) are a product decision for later.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Tables
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trade_subscriptions (
  user_id                 UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  free_trials_used        INTEGER NOT NULL DEFAULT 0 CHECK (free_trials_used BETWEEN 0 AND 3),
  subscription_expires_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only ledger of every trade offer that consumed a trial / subscription slot.
CREATE TABLE IF NOT EXISTS public.trade_usage (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_offer_id UUID UNIQUE REFERENCES public.trade_offers(id) ON DELETE SET NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('free_trial', 'subscription')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trade_usage_user ON public.trade_usage (user_id, created_at DESC);

-- Payment records. Financial history is kept even if the user is later removed.
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  plan                TEXT NOT NULL DEFAULT 'trade_annual',
  amount_paise        INTEGER NOT NULL CHECK (amount_paise > 0),
  currency            TEXT NOT NULL DEFAULT 'INR',
  provider            TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id   TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT UNIQUE,
  status              TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user ON public.subscription_payments (user_id, created_at DESC);

-- --------------------------------------------------------------------
-- 2. RLS: users may only READ their own rows. No client write policies exist.
-- --------------------------------------------------------------------
ALTER TABLE public.trade_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_usage           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own trade subscription" ON public.trade_subscriptions;
CREATE POLICY "Users read own trade subscription" ON public.trade_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own trade usage" ON public.trade_usage;
CREATE POLICY "Users read own trade usage" ON public.trade_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own subscription payments" ON public.subscription_payments;
CREATE POLICY "Users read own subscription payments" ON public.subscription_payments
  FOR SELECT USING (auth.uid() = user_id);

REVOKE ALL ON public.trade_subscriptions, public.trade_usage, public.subscription_payments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.trade_subscriptions, public.trade_usage, public.subscription_payments TO authenticated;
GRANT ALL    ON public.trade_subscriptions, public.trade_usage, public.subscription_payments TO service_role;

-- --------------------------------------------------------------------
-- 3. Read access summary for the signed-in user
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_trade_access()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid    uuid := auth.uid();
  rec    public.trade_subscriptions%ROWTYPE;
  used   integer;
  active boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO rec FROM public.trade_subscriptions WHERE user_id = uid;
  used   := COALESCE(rec.free_trials_used, 0);
  active := rec.subscription_expires_at IS NOT NULL AND rec.subscription_expires_at > now();

  RETURN jsonb_build_object(
    'free_trials_total',        3,
    'free_trials_used',         used,
    'free_trials_remaining',    GREATEST(0, 3 - used),
    'subscription_active',      active,
    'subscription_expires_at',  rec.subscription_expires_at,
    'can_trade',                active OR used < 3,
    'annual_price_inr',         299
  );
END;
$$;

-- --------------------------------------------------------------------
-- 4. The single, enforced entry point for creating a trade offer
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_trade_offer(
  p_listing_id               uuid,
  p_offered_item_title       text,
  p_offered_item_description text,
  p_offered_item_image       text,
  p_offered_item_value       numeric,
  p_cash_adjustment          numeric,
  p_negotiation_notes        text,
  p_terms_accepted           boolean DEFAULT true
)
RETURNS public.trade_offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid   uuid := auth.uid();
  lst   public.listings%ROWTYPE;
  sub   public.trade_subscriptions%ROWTYPE;
  usage_kind text;
  offer public.trade_offers%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000';
  END IF;

  IF p_offered_item_title IS NULL OR length(trim(p_offered_item_title)) = 0 OR length(p_offered_item_title) > 200 THEN
    RAISE EXCEPTION 'INVALID_OFFER: item title is required (max 200 characters).';
  END IF;
  IF p_offered_item_value IS NULL OR p_offered_item_value < 0 OR p_offered_item_value > 10000000 THEN
    RAISE EXCEPTION 'INVALID_OFFER: estimated value must be between 0 and 10,000,000.';
  END IF;
  IF p_cash_adjustment IS NULL OR abs(p_cash_adjustment) > 10000000 THEN
    RAISE EXCEPTION 'INVALID_OFFER: cash adjustment is out of range.';
  END IF;

  SELECT * INTO lst FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND OR lst.status <> 'active' THEN
    RAISE EXCEPTION 'LISTING_UNAVAILABLE: this listing is no longer available.';
  END IF;
  IF lst.listing_type <> 'trade' THEN
    RAISE EXCEPTION 'NOT_A_TRADE_LISTING: this listing does not accept trade offers.';
  END IF;
  IF lst.user_id = uid THEN
    RAISE EXCEPTION 'CANNOT_TRADE_OWN_LISTING: you cannot trade with your own listing.';
  END IF;

  -- Lock this user's allowance row so concurrent offers serialise.
  INSERT INTO public.trade_subscriptions (user_id) VALUES (uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO sub FROM public.trade_subscriptions WHERE user_id = uid FOR UPDATE;

  IF sub.subscription_expires_at IS NOT NULL AND sub.subscription_expires_at > now() THEN
    usage_kind := 'subscription';
  ELSIF sub.free_trials_used < 3 THEN
    usage_kind := 'free_trial';
    UPDATE public.trade_subscriptions
       SET free_trials_used = free_trials_used + 1, updated_at = now()
     WHERE user_id = uid;
  ELSE
    RAISE EXCEPTION 'TRADE_SUBSCRIPTION_REQUIRED: your 3 free trade trials are used. An annual subscription (₹299) is required.'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.trade_offers (
    listing_id, requester_id, owner_id,
    offered_item_title, offered_item_description, offered_item_image,
    offered_item_value, cash_adjustment, status, negotiation_notes,
    terms_accepted, terms_accepted_at
  ) VALUES (
    p_listing_id, uid, lst.user_id,
    trim(p_offered_item_title), COALESCE(p_offered_item_description, ''), p_offered_item_image,
    p_offered_item_value, p_cash_adjustment, 'pending', p_negotiation_notes,
    COALESCE(p_terms_accepted, false), now()
  )
  RETURNING * INTO offer;

  INSERT INTO public.trade_usage (user_id, trade_offer_id, kind) VALUES (uid, offer.id, usage_kind);

  RETURN offer;
END;
$$;

-- --------------------------------------------------------------------
-- 5. Subscription activation: service_role ONLY (payment webhook)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_trade_subscription(p_payment_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pay      public.subscription_payments%ROWTYPE;
  base     timestamptz;
  new_exp  timestamptz;
BEGIN
  SELECT * INTO pay FROM public.subscription_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND';
  END IF;
  IF pay.user_id IS NULL THEN
    RAISE EXCEPTION 'PAYMENT_HAS_NO_USER';
  END IF;

  -- Idempotent: a replayed webhook must not extend the subscription twice.
  IF pay.status = 'paid' THEN
    SELECT subscription_expires_at INTO new_exp FROM public.trade_subscriptions WHERE user_id = pay.user_id;
    RETURN new_exp;
  END IF;

  INSERT INTO public.trade_subscriptions (user_id) VALUES (pay.user_id) ON CONFLICT (user_id) DO NOTHING;

  SELECT GREATEST(now(), COALESCE(subscription_expires_at, now()))
    INTO base
    FROM public.trade_subscriptions
   WHERE user_id = pay.user_id
   FOR UPDATE;

  new_exp := base + interval '1 year';

  UPDATE public.trade_subscriptions
     SET subscription_expires_at = new_exp, updated_at = now()
   WHERE user_id = pay.user_id;

  UPDATE public.subscription_payments
     SET status = 'paid', paid_at = now(), period_start = base, period_end = new_exp
   WHERE id = p_payment_id;

  RETURN new_exp;
END;
$$;

-- --------------------------------------------------------------------
-- 6. Close the old, unmetered path: direct INSERTs into trade_offers.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can make trade offers" ON public.trade_offers;
REVOKE INSERT ON public.trade_offers FROM PUBLIC, anon, authenticated;

-- --------------------------------------------------------------------
-- 7. Function privileges (functions default to EXECUTE for PUBLIC)
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_trade_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trade_access() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_trade_offer(uuid, text, text, text, numeric, numeric, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_trade_offer(uuid, text, text, text, numeric, numeric, text, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.activate_trade_subscription(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_trade_subscription(uuid) TO service_role;
