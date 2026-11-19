-- ====================================================================
-- NARMIS DEMO DATA SEED SCRIPT
-- ====================================================================

-- Demo profiles (mock user UUIDs)
INSERT INTO public.profiles (id, full_name, avatar_url, bio, location, rating, review_count)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Tech enthusiast, mechanical keyboard collector, amateur photographer.', 'Indiranagar, Bengaluru', 4.9, 18),
  ('b2222222-2222-2222-2222-222222222222', 'Priya Patel', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Film student, creative writer, cricket fan.', 'Koramangala, Bengaluru', 4.8, 14),
  ('c3333333-3333-3333-3333-333333333333', 'Rohan Verma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Robotics student, DIY hardware hacker & outdoor sports lover.', 'Whitefield, Bengaluru', 5.0, 9),
  ('d4444444-4444-4444-4444-444444444444', 'Ananya Iyer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Designer and gamer, trading accessories and electronics.', 'HSR Layout, Bengaluru', 4.95, 23)
ON CONFLICT (id) DO NOTHING;

-- Demo Listings
INSERT INTO public.listings (
  id, user_id, title, description, category, condition, listing_type,
  rental_price, rental_duration, availability_status,
  estimated_value, trade_desired, trade_cash_adjustment,
  purchase_price, location, status, featured
) VALUES
  -- 1. RENT: Sony Alpha 7 IV Camera with 28-70mm Lens
  (
    'e1111111-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'Sony Alpha 7 IV Full-Frame Camera + 28-70mm Lens',
    'Professional full-frame 33MP hybrid mirrorless camera. Includes two high capacity batteries, 128GB v90 SD card, and padded travel bag. Perfect for weekend film shoots, campus projects, and travel photography.',
    'Photography',
    'Like New',
    'rent',
    1200.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Koramangala, Bengaluru',
    'active',
    true
  ),
  -- 2. RENT: MacBook Air M2 16GB RAM for Hackathons
  (
    'e1111111-0000-0000-0000-000000000002',
    'a1111111-1111-1111-1111-111111111111',
    'Apple MacBook Air M2 (16GB RAM, 512GB SSD) - Space Grey',
    'Lightweight powerhouse, 18-hour battery life. Upgraded 16GB memory makes it ideal for coding sprints, ML demos, and 4K editing. Includes MagSafe charger and protective neoprene sleeve.',
    'Computers and Accessories',
    'Excellent',
    'rent',
    750.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Indiranagar, Bengaluru',
    'active',
    true
  ),
  -- 3. RENT: Wilson Pro Staff Tennis Racket Set (Pair + Balls)
  (
    'e1111111-0000-0000-0000-000000000003',
    'c3333333-3333-3333-3333-333333333333',
    'Wilson Pro Staff 97 v14 Tennis Rackets (Pair) + Fresh Can of Balls',
    'Precision engineered 315g balance, freshly restrung with Luxilon ALU Power at 52 lbs. Includes two matching rackets and Wilson tour duffel bag.',
    'Sports Equipment',
    'Good',
    'rent',
    350.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Whitefield, Bengaluru',
    'active',
    false
  ),
  -- 4. TRADE: Keychron Q1 Pro Custom Mechanical Keyboard
  (
    'e1111111-0000-0000-0000-000000000004',
    'a1111111-1111-1111-1111-111111111111',
    'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (Gateron Brown)',
    'Full CNC aluminum body, hot-swappable, sound-dampened with PORON foam. Looking to trade for a premium ergonomic mouse (Logitech MX Master 3S) or audio interface with slight cash offset.',
    'Computers and Accessories',
    'Like New',
    'trade',
    NULL, NULL, NULL,
    11500.00,
    'Logitech MX Master 3S Mouse OR Focusrite Scarlett Solo Audio Interface',
    1500.00,
    NULL,
    'Indiranagar, Bengaluru',
    'active',
    true
  ),
  -- 5. TRADE: SS Ton Reserve Edition Grade-1 English Willow Cricket Bat
  (
    'e1111111-0000-0000-0000-000000000005',
    'b2222222-2222-2222-2222-222222222222',
    'SS Ton Reserve Edition Grade-1 English Willow Cricket Bat',
    'Handcrafted selected Grade 1 English willow, 1180g balanced pickup with 8 straight grains. Knocked in with 15,000 mallet hits and ready to play. Looking to trade for a high-end gaming monitor (144Hz+) or trading for cricket kit bag with accessories.',
    'Cricket Equipment',
    'Brand New',
    'trade',
    NULL, NULL, NULL,
    14000.00,
    '27-inch 144Hz IPS Monitor OR Sony WH-1000XM4 Headphones',
    0.00,
    NULL,
    'Koramangala, Bengaluru',
    'active',
    true
  ),
  -- 6. TRADE: Complete 7-Book Hardcover Box Set - The Lord of the Rings & Hobbit
  (
    'e1111111-0000-0000-0000-000000000006',
    'd4444444-4444-4444-4444-444444444444',
    'Tolkien Illustrated Collector Edition 7-Book Hardcover Boxset',
    'Deluxe clothbound edition with Alan Lee original illustrations and foldout maps of Middle-earth. Wanting to trade for sci-fi collector sets (Dune, Foundation) or manga box sets.',
    'Books',
    'Like New',
    'trade',
    NULL, NULL, NULL,
    4500.00,
    'Dune Deluxe Hardcover Trilogy OR One Piece Box Set 1',
    500.00,
    NULL,
    'HSR Layout, Bengaluru',
    'active',
    false
  ),
  -- 7. PURCHASE: Sony WH-1000XM5 Wireless Noise Cancelling Headphones
  (
    'e1111111-0000-0000-0000-000000000007',
    'd4444444-4444-4444-4444-444444444444',
    'Sony WH-1000XM5 Active Noise Cancelling Wireless Headphones - Silver',
    'Industry leading ANC with 8 microphones and Auto NC Optimizer. Battery lasts 30 hours on a single charge. 8 months old, barely used at desk, flawless condition with original magnetic case and audio cables.',
    'Electronics',
    'Like New',
    'purchase',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    19500.00,
    'HSR Layout, Bengaluru',
    'active',
    true
  ),
  -- 8. PURCHASE: Bosch Professional 18V Cordless Drill & 100-pc Bit Kit
  (
    'e1111111-0000-0000-0000-000000000008',
    'c3333333-3333-3333-3333-333333333333',
    'Bosch GSB 185-LI Cordless Combi Drill Kit (2x 2.0Ah Batteries + Charger)',
    'Brushless motor for high efficiency and endurance. Capable of hammer drilling into masonry, wood, and steel. Selling after completing home renovation workshop.',
    'Tools and Equipment',
    'Excellent',
    'purchase',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    6200.00,
    'Whitefield, Bengaluru',
    'active',
    false
  ),
  -- 9. PURCHASE: Herman Miller Sayl Ergonomic Office Chair
  (
    'e1111111-0000-0000-0000-000000000009',
    'a1111111-1111-1111-1111-111111111111',
    'Herman Miller Sayl Ergonomic Swivel Desk Chair - Fog/Slate Grey',
    'Yves Béhar suspension back design providing 3D intelligent support. Forward tilt, tilt limiter, and fully adjustable 3D armrests. Super clean condition.',
    'Furniture',
    'Excellent',
    'purchase',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    31000.00,
    'Indiranagar, Bengaluru',
    'active',
    true
  ),
  -- 10. PURCHASE: Nintendo Switch OLED with Zelda: Tears of the Kingdom
  (
    'e1111111-0000-0000-0000-000000000010',
    'd4444444-4444-4444-4444-444444444444',
    'Nintendo Switch OLED Console (White) + Zelda TOTK Game Card',
    '7-inch vibrant OLED screen, 64GB storage, enhanced audio dock with LAN port. Screen protector applied from day 1, includes Zelda Tears of the Kingdom cartridge and travel case.',
    'Gaming',
    'Like New',
    'purchase',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    23500.00,
    'HSR Layout, Bengaluru',
    'active',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Images
INSERT INTO public.listing_images (listing_id, image_url, is_primary) VALUES
  ('e1111111-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', true),
  ('e1111111-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', false),
  ('e1111111-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', true),
  ('e1111111-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800', true),
  ('e1111111-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', true),
  ('e1111111-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', true),
  ('e1111111-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', true),
  ('e1111111-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', true),
  ('e1111111-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', true),
  ('e1111111-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1580481077195-c3a8b417248d?w=800', true),
  ('e1111111-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800', true)
ON CONFLICT (id) DO NOTHING;
