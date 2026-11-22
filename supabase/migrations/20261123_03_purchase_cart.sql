-- ====================================================================
-- NARMIS  |  Migration 3 of 3  |  Persistent purchase cart + safe checkout
-- --------------------------------------------------------------------
-- DESIGN
--   * cart_items is per user and stored in Postgres, so the cart follows
--     the account across devices (and realtime keeps open tabs in sync).
--   * Clients may only READ / DELETE their own cart rows. Adding or changing
--     quantities goes through RPCs that re-validate the listing every time
--     (active, a purchase listing, not your own, within stock).
--   * Purchases can ONLY be created by public.checkout_purchase(). It locks
--     each listing, re-checks availability, computes the amount on the SERVER
--     (the client can never choose the price), reserves stock and clears the
--     cart in one transaction. Direct INSERT into purchases is revoked.
--   * No payment is verified here. Rows are created as 'payment_submitted' /
--     'Payment Submitted' – the seller (or a future gateway webhook) verifies.
--   * Sellers can change ONLY status / verification fields of a purchase;
--     amount, buyer, receipt etc. are immutable for API users.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Stock on listings + order detail on purchases (additive)
-- --------------------------------------------------------------------
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS quantity_available INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_quantity_available_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_quantity_available_check
  CHECK (quantity_available BETWEEN 0 AND 100);

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS quantity          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price        NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS checkout_group_id UUID;

ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_quantity_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_quantity_check CHECK (quantity >= 1);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer  ON public.purchases (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_seller ON public.purchases (seller_id, created_at DESC);

-- --------------------------------------------------------------------
-- 2. cart_items
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items (user_id, created_at DESC);

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

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own cart" ON public.cart_items;
CREATE POLICY "Users read own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own cart items" ON public.cart_items;
CREATE POLICY "Users delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

REVOKE ALL ON public.cart_items FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;

-- --------------------------------------------------------------------
-- 3. Cart RPCs
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_to_cart(p_listing_id uuid, p_quantity integer DEFAULT 1)
RETURNS public.cart_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid          uuid := auth.uid();
  lst          public.listings%ROWTYPE;
  existing_qty integer;
  new_qty      integer;
  item         public.cart_items%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: quantity must be between 1 and 100.';
  END IF;

  SELECT * INTO lst FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND OR lst.status <> 'active' THEN
    RAISE EXCEPTION 'LISTING_UNAVAILABLE: this listing is no longer available.';
  END IF;
  IF lst.listing_type <> 'purchase' THEN
    RAISE EXCEPTION 'NOT_A_PURCHASE_LISTING: only items for sale can be added to the cart.';
  END IF;
  IF lst.user_id = uid THEN
    RAISE EXCEPTION 'CANNOT_BUY_OWN_LISTING: you cannot buy your own listing.';
  END IF;

  SELECT quantity INTO existing_qty FROM public.cart_items WHERE user_id = uid AND listing_id = p_listing_id;
  new_qty := COALESCE(existing_qty, 0) + p_quantity;

  IF new_qty > lst.quantity_available THEN
    RAISE EXCEPTION 'QUANTITY_EXCEEDS_AVAILABLE: only % available.', lst.quantity_available;
  END IF;

  INSERT INTO public.cart_items (user_id, listing_id, quantity)
  VALUES (uid, p_listing_id, new_qty)
  ON CONFLICT (user_id, listing_id)
  DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now()
  RETURNING * INTO item;

  RETURN item;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_cart_quantity(p_listing_id uuid, p_quantity integer)
RETURNS public.cart_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid  uuid := auth.uid();
  lst  public.listings%ROWTYPE;
  item public.cart_items%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity > 100 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: quantity must be between 1 and 100.';
  END IF;

  -- Zero or negative removes the line.
  IF p_quantity < 1 THEN
    DELETE FROM public.cart_items WHERE user_id = uid AND listing_id = p_listing_id;
    RETURN NULL;
  END IF;

  SELECT * INTO lst FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND OR lst.status <> 'active' THEN
    RAISE EXCEPTION 'LISTING_UNAVAILABLE: this listing is no longer available.';
  END IF;
  IF p_quantity > lst.quantity_available THEN
    RAISE EXCEPTION 'QUANTITY_EXCEEDS_AVAILABLE: only % available.', lst.quantity_available;
  END IF;

  UPDATE public.cart_items
     SET quantity = p_quantity, updated_at = now()
   WHERE user_id = uid AND listing_id = p_listing_id
  RETURNING * INTO item;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CART_ITEM_NOT_FOUND: this item is not in your cart.';
  END IF;

  RETURN item;
END;
$$;

-- --------------------------------------------------------------------
-- 4. Checkout: the ONLY way a purchase row is created
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.checkout_purchase(
  p_items             jsonb,
  p_address           text,
  p_payment_reference text DEFAULT NULL,
  p_clear_cart        boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid      uuid := auth.uid();
  it       record;
  lst      public.listings%ROWTYPE;
  pur      public.purchases%ROWTYPE;
  group_id uuid := gen_random_uuid();
  result   jsonb := '[]'::jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000';
  END IF;
  IF p_address IS NULL OR length(trim(p_address)) < 3 OR length(p_address) > 500 THEN
    RAISE EXCEPTION 'INVALID_ADDRESS: a handover address is required.';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER: no items to purchase.';
  END IF;
  IF jsonb_array_length(p_items) > 20 THEN
    RAISE EXCEPTION 'ORDER_TOO_LARGE: at most 20 items per checkout.';
  END IF;

  -- Merge duplicate lines and lock in a stable order (prevents deadlocks).
  FOR it IN
    SELECT (e->>'listing_id')::uuid AS listing_id,
           SUM(COALESCE((e->>'quantity')::int, 1))::int AS qty
      FROM jsonb_array_elements(p_items) AS e
     GROUP BY (e->>'listing_id')::uuid
     ORDER BY (e->>'listing_id')::uuid
  LOOP
    IF it.qty IS NULL OR it.qty < 1 OR it.qty > 100 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: quantity must be between 1 and 100.';
    END IF;

    SELECT * INTO lst FROM public.listings WHERE id = it.listing_id FOR UPDATE;
    IF NOT FOUND OR lst.status <> 'active' THEN
      RAISE EXCEPTION 'LISTING_UNAVAILABLE: an item in your order is no longer available.';
    END IF;
    IF lst.listing_type <> 'purchase' OR lst.purchase_price IS NULL OR lst.purchase_price <= 0 THEN
      RAISE EXCEPTION 'NOT_A_PURCHASE_LISTING: "%" is not available for purchase.', lst.title;
    END IF;
    IF lst.user_id = uid THEN
      RAISE EXCEPTION 'CANNOT_BUY_OWN_LISTING: you cannot buy your own listing.';
    END IF;
    IF it.qty > lst.quantity_available THEN
      RAISE EXCEPTION 'QUANTITY_EXCEEDS_AVAILABLE: only % of "%" available.', lst.quantity_available, lst.title;
    END IF;

    INSERT INTO public.purchases (
      listing_id, buyer_id, seller_id, amount, quantity, unit_price, checkout_group_id,
      status, payment_method, receipt_number, shipping_address, payment_reference,
      payment_confirmed_by_buyer, payment_confirmed_at, payment_verification_status
    ) VALUES (
      lst.id, uid, lst.user_id, lst.purchase_price * it.qty, it.qty, lst.purchase_price, group_id,
      'payment_submitted', 'UPI_QR',
      'NRM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
      trim(p_address), NULLIF(trim(COALESCE(p_payment_reference, '')), ''),
      true, now(), 'Payment Submitted'
    )
    RETURNING * INTO pur;

    -- Reserve stock; the listing leaves the public feed when fully reserved.
    UPDATE public.listings
       SET quantity_available = quantity_available - it.qty,
           status = CASE WHEN quantity_available - it.qty <= 0 THEN 'pending' ELSE status END
     WHERE id = lst.id;

    result := result || to_jsonb(pur);
  END LOOP;

  IF p_clear_cart THEN
    DELETE FROM public.cart_items
     WHERE user_id = uid
       AND listing_id IN (SELECT (e->>'listing_id')::uuid FROM jsonb_array_elements(p_items) AS e);
  END IF;

  RETURN result;
END;
$$;

-- --------------------------------------------------------------------
-- 5. Protect payment records
-- --------------------------------------------------------------------
-- 5a. No direct inserts: purchases are created only by checkout_purchase().
DROP POLICY IF EXISTS "Buyers can record purchase payment" ON public.purchases;
DROP POLICY IF EXISTS "Buyers can record demo purchase" ON public.purchases;
REVOKE INSERT ON public.purchases FROM PUBLIC, anon, authenticated;

-- 5b. API users (sellers) may only change status / verification fields.
CREATE OR REPLACE FUNCTION public.protect_purchase_payment_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) IN ('authenticated', 'anon') THEN
    NEW.id                         := OLD.id;
    NEW.listing_id                 := OLD.listing_id;
    NEW.buyer_id                   := OLD.buyer_id;
    NEW.seller_id                  := OLD.seller_id;
    NEW.amount                     := OLD.amount;
    NEW.quantity                   := OLD.quantity;
    NEW.unit_price                 := OLD.unit_price;
    NEW.checkout_group_id          := OLD.checkout_group_id;
    NEW.payment_method             := OLD.payment_method;
    NEW.payment_reference          := OLD.payment_reference;
    NEW.payment_confirmed_by_buyer := OLD.payment_confirmed_by_buyer;
    NEW.payment_confirmed_at       := OLD.payment_confirmed_at;
    NEW.receipt_number             := OLD.receipt_number;
    NEW.shipping_address           := OLD.shipping_address;
    NEW.created_at                 := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_purchase_payment_fields ON public.purchases;
CREATE TRIGGER trg_protect_purchase_payment_fields
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.protect_purchase_payment_fields();

-- 5c. Keep stock honest when a seller cancels / verifies an order.
CREATE OR REPLACE FUNCTION public.purchases_inventory_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.status = 'cancelled' OR NEW.payment_verification_status = 'Cancelled')
     AND NOT (OLD.status = 'cancelled' OR OLD.payment_verification_status = 'Cancelled') THEN
    UPDATE public.listings
       SET quantity_available = LEAST(100, quantity_available + NEW.quantity),
           status = CASE WHEN status = 'pending' THEN 'active' ELSE status END
     WHERE id = NEW.listing_id;
  ELSIF NEW.payment_verification_status = 'Verified'
        AND OLD.payment_verification_status IS DISTINCT FROM 'Verified' THEN
    UPDATE public.listings
       SET status = 'completed'
     WHERE id = NEW.listing_id AND quantity_available = 0 AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_purchases_inventory_sync ON public.purchases;
CREATE TRIGGER trg_purchases_inventory_sync
  AFTER UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.purchases_inventory_sync();

-- --------------------------------------------------------------------
-- 6. Function privileges
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.add_to_cart(uuid, integer)                     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_cart_quantity(uuid, integer)               FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.checkout_purchase(jsonb, text, text, boolean)  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_to_cart(uuid, integer)                    TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_cart_quantity(uuid, integer)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_purchase(jsonb, text, text, boolean) TO authenticated;

-- --------------------------------------------------------------------
-- 7. Realtime so the cart updates live across a user's open devices
-- --------------------------------------------------------------------
DO $rt$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cart_items'
     )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
  END IF;
END
$rt$;
