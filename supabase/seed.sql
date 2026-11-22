-- ====================================================================
-- NARMIS DEMO DATA SEED SCRIPT
-- Predefined Profiles: Vipan, Shraddha, Sanchit, Shadabh, Harshit, Naina, Javed Bhaiya
-- ====================================================================

-- 7 Predefined profiles
INSERT INTO public.profiles (id, full_name, avatar_url, bio, location, rating, review_count)
VALUES
  ('u1111111-1111-1111-1111-111111111111', 'Vipan', 'https://api.dicebear.com/7.x/shapes/svg?seed=Vipan&backgroundColor=142523,80674D&shape1Color=EAD3AA', 'Electronics maker & hardware engineer. Circuit enthusiast, oscilloscope and soldering gear custodian.', 'Indiranagar, Bengaluru', 4.9, 28),
  ('u2222222-2222-2222-2222-222222222222', 'Shraddha', 'https://api.dicebear.com/7.x/shapes/svg?seed=Shraddha&backgroundColor=80674D,142523&shape1Color=B88A4A', 'Cinematographer, vocalist and indie fashion curator. Cameras, studio sound & vintage aesthetic.', 'Koramangala, Bengaluru', 4.95, 34),
  ('u3333333-3333-3333-3333-333333333333', 'Sanchit', 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanchit&backgroundColor=B88A4A,142523&shape1Color=EAD3AA', 'Varsity volleyball spiker, competitive gamer & mechanical keyboard builder. PS5 & gaming peripherals.', 'Whitefield, Bengaluru', 4.85, 21),
  ('u4444444-4444-4444-4444-444444444444', 'Shadabh', 'https://api.dicebear.com/7.x/shapes/svg?seed=Shadabh&backgroundColor=304943,142523&shape1Color=EAD3AA', 'CS graduate researcher, collector of algorithms books, Tolkien hardcovers & engineering study notes.', 'HSR Layout, Bengaluru', 5.0, 19),
  ('u5555555-5555-5555-5555-555555555555', 'Harshit', 'https://api.dicebear.com/7.x/shapes/svg?seed=Harshit&backgroundColor=1D302C,80674D&shape1Color=B88A4A', 'Creative designer, custom sticker designer, retro Apple tech archivist & rare stationery collector.', 'Church Street, Bengaluru', 4.9, 16),
  ('u6666666-6666-6666-6666-666666666666', 'Naina', 'https://api.dicebear.com/7.x/shapes/svg?seed=Naina&backgroundColor=80674D,B88A4A&shape1Color=EAD3AA', 'Fashion & beauty enthusiast. Curating runway dresses, clean beauty essentials and artisan jewellery.', 'Lavelle Road, Bengaluru', 4.95, 25),
  ('u7777777-7777-7777-7777-777777777777', 'Javed Bhaiya', 'https://api.dicebear.com/7.x/shapes/svg?seed=JavedBhaiya&backgroundColor=142523,304943&shape1Color=B88A4A', 'FPV drone engineer, telemetry specialist & custom quadcopter builder. Radio transmitters, motors & flight stacks.', 'Electronic City, Bengaluru', 5.0, 39)
ON CONFLICT (id) DO NOTHING;

-- Demo Listings
INSERT INTO public.listings (
  id, user_id, title, description, category, condition, listing_type,
  rental_price, rental_duration, availability_status,
  estimated_value, trade_desired, trade_cash_adjustment,
  purchase_price, location, status, featured
) VALUES
  -- 1. Vipan (Electronics)
  (
    'e1111111-0000-0000-0000-000000000001',
    'u1111111-1111-1111-1111-111111111111',
    'Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope',
    'Calibrated 4-channel digital storage oscilloscope with 1GSa/s sampling rate, 24Mpts memory depth. Includes 4 passive probes and protective case. Ideal for debugging embedded hardware and audio circuits.',
    'Tools and Equipment',
    'Like New',
    'rent',
    450.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Indiranagar, Bengaluru',
    'active',
    true
  ),
  (
    'e1111111-0000-0000-0000-000000000002',
    'u1111111-1111-1111-1111-111111111111',
    'Arduino Uno R4 WiFi + Ultimate Sensor Starter Kit',
    'Original Arduino Uno R4 with ESP32-S3 onboard WiFi/BLE plus 37 sensor modules, jumper cables, OLED display, and acrylic base. Looking to trade for a Raspberry Pi 4 / 5 or STM32 development board.',
    'Electronics',
    'Like New',
    'trade',
    NULL, NULL, NULL,
    3800.00,
    'Raspberry Pi 4 Model B (4GB/8GB) OR STM32 Nucleo board',
    500.00,
    NULL,
    'Indiranagar, Bengaluru',
    'active',
    true
  ),
  -- 2. Shraddha (Cameras, Music, Fashion)
  (
    'e1111111-0000-0000-0000-000000000003',
    'u2222222-2222-2222-2222-222222222222',
    'Sony Alpha 7 IV Full-Frame Camera + 24-70mm f/2.8 GM Lens',
    'Full-frame 33MP hybrid mirrorless camera paired with G-Master f/2.8 zoom lens. Includes 2 high-capacity batteries, 128GB v90 SD card, and padded travel case.',
    'Photography',
    'Like New',
    'rent',
    1400.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Koramangala, Bengaluru',
    'active',
    true
  ),
  (
    'e1111111-0000-0000-0000-000000000004',
    'u2222222-2222-2222-2222-222222222222',
    'Shure SM7B Vocal Studio Microphone + Cloudlifter CL-1',
    'Broadcast vocal dynamic microphone with Cloudlifter inline preamp and shockmount. Pristine warm vocal tone for podcasts, studio singing and voiceover work.',
    'Music and Audio',
    'Like New',
    'rent',
    600.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Koramangala, Bengaluru',
    'active',
    true
  ),
  -- 3. Sanchit (Sports, Gaming & PC)
  (
    'e1111111-0000-0000-0000-000000000005',
    'u3333333-3333-3333-3333-333333333333',
    'PlayStation 5 Disc Edition + DualSense Controller + FIFA 24',
    'Sony PS5 Disc Edition console in mint condition. Includes 2 DualSense wireless controllers, HDMI 2.1 cable, charging dock, and disc games.',
    'Gaming',
    'Like New',
    'rent',
    800.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Whitefield, Bengaluru',
    'active',
    true
  ),
  (
    'e1111111-0000-0000-0000-000000000006',
    'u3333333-3333-3333-3333-333333333333',
    'Mikasa V200W Official FIVB Match Volleyball',
    'Official Olympic & FIVB game ball. Dimpled microfiber surface with 18-panel aerodynamic design and optimal grip. Freshly inflated with pressure gauge.',
    'Sports Equipment',
    'Brand New',
    'purchase',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    4200.00,
    'Whitefield, Bengaluru',
    'active',
    true
  ),
  -- 4. Shadabh (Books & Study Materials)
  (
    'e1111111-0000-0000-0000-000000000007',
    'u4444444-4444-4444-4444-444444444444',
    'CLRS Introduction to Algorithms (4th Edition) + Clean Code Combo',
    'Hardcover 4th Edition of MIT Press CLRS Algorithms along with Robert C. Martin Clean Code. Unmarked pages, no highlights, dust jacket intact.',
    'Books',
    'Like New',
    'rent',
    120.00,
    'Weekly',
    'available',
    NULL, NULL, NULL, NULL,
    'HSR Layout, Bengaluru',
    'active',
    true
  ),
  -- 5. Harshit (Unique & Creative Items)
  (
    'e1111111-0000-0000-0000-000000000008',
    'u5555555-5555-5555-5555-555555555555',
    'Apple MacBook Air M2 (16GB RAM, 512GB SSD) - Space Grey',
    'Upgraded 16GB memory model, 18-hour battery life. Ideal for design work, dev sprints, and college projects. Includes MagSafe braided cable and hardshell sleeve.',
    'Computers and Accessories',
    'Excellent',
    'rent',
    750.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Church Street, Bengaluru',
    'active',
    true
  ),
  -- 6. Naina (Makeup, Fashion & Aesthetic)
  (
    'e1111111-0000-0000-0000-000000000009',
    'u6666666-6666-6666-6666-666666666666',
    'Dyson Airwrap Multi-Styler Complete Long (Copper / Nickel)',
    'Authentic Dyson Airwrap multi-styler with all 6 styling attachments, filter cleaning brush, and presentation storage case. Perfect for events and shoots.',
    'Fashion & Apparel',
    'Like New',
    'rent',
    950.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Lavelle Road, Bengaluru',
    'active',
    true
  ),
  -- 7. Javed Bhaiya (Drones, Motors & Controllers)
  (
    'e1111111-0000-0000-0000-000000000010',
    'u7777777-7777-7777-7777-777777777777',
    'RadioMaster TX16S Mark II MAX Radio Controller (ELRS 2.4GHz)',
    'Flagship EdgeTX transmitter with AG01 CNC Hall gimbals, carbon fiber faceplate, color touch screen, and internal ExpressLRS 2.4GHz module. Includes neck strap and case.',
    'Electronics',
    'Like New',
    'rent',
    550.00,
    'Daily',
    'available',
    NULL, NULL, NULL, NULL,
    'Electronic City, Bengaluru',
    'active',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Images
INSERT INTO public.listing_images (listing_id, image_url, is_primary) VALUES
  ('e1111111-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', true),
  ('e1111111-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800', true),
  ('e1111111-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', true),
  ('e1111111-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800', true),
  ('e1111111-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800', true),
  ('e1111111-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', true),
  ('e1111111-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800', true),
  ('e1111111-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', true),
  ('e1111111-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', true),
  ('e1111111-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800', true)
ON CONFLICT (id) DO NOTHING;
