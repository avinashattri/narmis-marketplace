-- ====================================================================
-- NARMIS P2P MARKETPLACE - COMPLETE BACKEND SYNC & SECURITY MIGRATION
-- Adds missing community_requests table, messaging update policies &
-- triggers, profile insert policy, rating aggregation, and realtime.
-- Safe and idempotent: preserves all existing tables and user data.
-- ====================================================================

-- 1. PROFILES: allow authenticated users to insert their own profile row on upsert fallback
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. COMMUNITY REQUESTS TABLE (Previously missing from schema)
CREATE TABLE IF NOT EXISTS public.community_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL CHECK (char_length(trim(item_name)) > 0 AND char_length(item_name) <= 200),
  category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN (
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
  )),
  listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'trade', 'purchase')),
  details TEXT CHECK (coalesce(char_length(details), 0) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_requests_user ON public.community_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_created ON public.community_requests(created_at DESC);

ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community requests viewable by everyone" ON public.community_requests;
CREATE POLICY "Community requests viewable by everyone" ON public.community_requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create community requests" ON public.community_requests;
CREATE POLICY "Authenticated users create community requests" ON public.community_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners update own community requests" ON public.community_requests;
CREATE POLICY "Owners update own community requests" ON public.community_requests
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners delete own community requests" ON public.community_requests;
CREATE POLICY "Owners delete own community requests" ON public.community_requests
  FOR DELETE USING (auth.uid() = user_id);

-- 3. CONVERSATIONS & MESSAGES: Add missing UPDATE policies and immutability / sync triggers
DROP POLICY IF EXISTS "Participants update conversations" ON public.conversations;
CREATE POLICY "Participants update conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Participants mark messages read" ON public.messages;
CREATE POLICY "Participants mark messages read" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- Prevent editing historical message content/sender; only allow updating is_read or metadata status
CREATE OR REPLACE FUNCTION public.protect_message_immutability()
RETURNS trigger AS $$
BEGIN
  IF current_setting('role', true) = 'authenticated' THEN
    NEW.conversation_id := OLD.conversation_id;
    NEW.sender_id := OLD.sender_id;
    NEW.content := OLD.content;
    NEW.message_type := OLD.message_type;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_message_immutability ON public.messages;
CREATE TRIGGER trg_protect_message_immutability
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.protect_message_immutability();

-- Automatically sync last_message_text and last_message_at when a message is inserted
CREATE OR REPLACE FUNCTION public.sync_conversation_last_message()
RETURNS trigger AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_text = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_conversation_last_message ON public.messages;
CREATE TRIGGER trg_sync_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.sync_conversation_last_message();

-- 4. REVIEWS: Recalculate target user's profile rating and review_count automatically
CREATE OR REPLACE FUNCTION public.recalc_profile_rating()
RETURNS trigger AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.target_user_id, OLD.target_user_id);
  UPDATE public.profiles
  SET
    rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.reviews r WHERE r.target_user_id = target_id), 5.00),
    review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.target_user_id = target_id),
    updated_at = NOW()
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalc_profile_rating ON public.reviews;
CREATE TRIGGER trg_recalc_profile_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.recalc_profile_rating();

-- 5. PREVENT SELF-RENTAL AND SELF-TRADE REQUESTS
ALTER TABLE public.rental_requests DROP CONSTRAINT IF EXISTS rental_requests_no_self;
ALTER TABLE public.rental_requests ADD CONSTRAINT rental_requests_no_self
  CHECK (renter_id <> owner_id);

ALTER TABLE public.trade_offers DROP CONSTRAINT IF EXISTS trade_offers_no_self;
ALTER TABLE public.trade_offers ADD CONSTRAINT trade_offers_no_self
  CHECK (requester_id <> owner_id);

-- 6. SUPABASE REALTIME PUBLICATION (Idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_offers;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.community_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
