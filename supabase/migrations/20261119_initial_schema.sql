-- ====================================================================
-- NARMIS P2P MARKETPLACE PLATFORM - DATABASE SCHEMA
-- Core Philosophy: RENT. TRADE. PURCHASE.
-- Tagline: Things have more than one life.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Electronics',
        'Computers and Accessories',
        'Books',
        'Tools and Equipment',
        'Photography',
        'Gaming',
        'Sports Equipment',
        'Cricket Equipment',
        'Furniture',
        'Other'
    )),
    condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Excellent', 'Good', 'Fair')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'trade', 'purchase')),
    
    -- Rent fields
    rental_price NUMERIC(10, 2),
    rental_duration TEXT CHECK (rental_duration IN ('Hourly', 'Daily', 'Weekly')),
    availability_status TEXT DEFAULT 'available',
    
    -- Trade fields
    estimated_value NUMERIC(10, 2),
    trade_desired TEXT,
    trade_cash_adjustment NUMERIC(10, 2) DEFAULT 0,
    
    -- Purchase fields
    purchase_price NUMERIC(10, 2),
    
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'inactive')),
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LISTING IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RENTAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.rental_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_type TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRADE OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.trade_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_item_title TEXT NOT NULL,
    offered_item_description TEXT NOT NULL,
    offered_item_image TEXT,
    offered_item_value NUMERIC(10, 2) NOT NULL,
    cash_adjustment NUMERIC(10, 2) DEFAULT 0, -- positive: requester offers extra cash; negative: requester asks cash
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    negotiation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    participant1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_participants CHECK (participant1_id <> participant2_id)
);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'rental_offer', 'trade_offer', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PURCHASES (DEMO CHECKOUT) TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
    payment_method TEXT DEFAULT 'DEMO_PAYMENT_HACKATHON',
    receipt_number TEXT NOT NULL UNIQUE,
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SAVED LISTINGS (FAVOURITES) TABLE
CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_listing ON public.trade_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_listing ON public.rental_requests(listing_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Listings: Public can view active listings, owners can view all their own
CREATE POLICY "Active listings are viewable by everyone" ON public.listings
    FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.listings
    FOR DELETE USING (auth.uid() = user_id);

-- Listing Images: Public read, owners create/modify
CREATE POLICY "Listing images viewable by everyone" ON public.listing_images
    FOR SELECT USING (true);
CREATE POLICY "Owners can manage listing images" ON public.listing_images
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = listing_images.listing_id AND user_id = auth.uid())
    );

-- Rental Requests: Participants can view/manage
CREATE POLICY "Participants view rental requests" ON public.rental_requests
    FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create rental requests" ON public.rental_requests
    FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Participants can update rental requests" ON public.rental_requests
    FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Trade Offers: Participants can view/manage
CREATE POLICY "Participants view trade offers" ON public.trade_offers
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Users can make trade offers" ON public.trade_offers
    FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update trade offers" ON public.trade_offers
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Conversations & Messages: Only participants
CREATE POLICY "Participants view conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Participants create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Participants view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
    );
CREATE POLICY "Participants insert messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
    );

-- Purchases: Only buyer or seller can view
CREATE POLICY "Buyers and sellers view purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can record demo purchase" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Saved Listings: Users view/modify own saved items
CREATE POLICY "Users view own saved listings" ON public.saved_listings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved listings" ON public.saved_listings
    FOR ALL USING (auth.uid() = user_id);

-- Reviews: Viewable by all, created by authenticated reviewers
CREATE POLICY "Reviews viewable by everyone" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ====================================================================
-- AUTO PROFILE CREATION TRIGGER ON SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, bio, location)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id),
    COALESCE(new.raw_user_meta_data->>'bio', 'NARMIS marketplace explorer.'),
    COALESCE(new.raw_user_meta_data->>'location', 'Bengaluru, India')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
