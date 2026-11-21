import { Listing, UserProfile, Conversation, Message, TradeOffer, RentalRequest, PurchaseTransaction, Review, CommunityRequest } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'u0000000-user-0000-0000-000000000000',
  full_name: 'Vipan',
  email: 'vipan.demo@narmis.in',
  avatar_url: 'https://ui-avatars.com/api/?name=Vipan&background=142523&color=EAD3AA&bold=true&size=150',
  bio: 'Hardware engineer, oscilloscope & electronics hacker. Believer in giving tech a second life.',
  location: 'Koramangala 4th Block, Bengaluru',
  rating: 4.95,
  review_count: 16,
  joined_date: 'March 2026',
};

export const DEMO_PROFILES: UserProfile[] = [
  CURRENT_USER,
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    full_name: 'Shraddha',
    email: 'shraddha@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Shraddha&background=80674D&color=F5E9D2&bold=true&size=150',
    bio: 'Filmmaker, vocalist & fashion curator. Listing cinema cameras, studio mics, and designer dresses.',
    location: 'Whitefield, Bengaluru',
    rating: 5.0,
    review_count: 21,
    joined_date: 'November 2025',
  },
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    full_name: 'Sanchit',
    email: 'sanchit@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Sanchit&background=B88A4A&color=142523&bold=true&size=150',
    bio: 'Volleyball championship player, PC builder & PS5 gamer. Trading peripherals and games.',
    location: 'Indiranagar, Bengaluru',
    rating: 4.9,
    review_count: 18,
    joined_date: 'January 2026',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    full_name: 'Harshit',
    email: 'harshit@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Harshit&background=1D302C&color=F5E9D2&bold=true&size=150',
    bio: 'Tech developer, sticker artist & cricket enthusiast. Sharing MacBooks, sticker packs & sports gear.',
    location: 'Koramangala, Bengaluru',
    rating: 4.85,
    review_count: 14,
    joined_date: 'February 2026',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    full_name: 'Shabadh',
    email: 'shabadh@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Shabadh&background=304943&color=EAD3AA&bold=true&size=150',
    bio: 'Bibliophile, sci-fi archivist & manga collector. Trading rare hardcovers and collector sets.',
    location: 'HSR Layout, Bengaluru',
    rating: 4.95,
    review_count: 23,
    joined_date: 'December 2025',
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    full_name: 'Naina',
    email: 'naina@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Naina&background=B88A4A&color=F5E9D2&bold=true&size=150',
    bio: 'Beauty enthusiast & modern fashion lover. Sharing luxury makeup vanity sets, hair stylers & chic dresses.',
    location: 'Lavelle Road, Bengaluru',
    rating: 4.98,
    review_count: 27,
    joined_date: 'January 2026',
  },
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    full_name: 'Javed Bhaiya',
    email: 'javed@narmis.in',
    avatar_url: 'https://ui-avatars.com/api/?name=Javed+Bhaiya&background=304943&color=EAD3AA&bold=true&size=150',
    bio: 'Master drone engineer, FPV builder & electronics technician. Custom drone builds, controllers & flight parts.',
    location: 'Frazer Town, Bengaluru',
    rating: 4.97,
    review_count: 32,
    joined_date: 'October 2025',
  },
];

export const INITIAL_LISTINGS: Listing[] = [
  // SHRADDHA'S LISTINGS (Cameras, Singing equipment, Dresses)
  {
    id: 'list-1',
    user_id: 'c3333333-3333-3333-3333-333333333333',
    user: DEMO_PROFILES[1], // Shraddha
    title: 'Sony Alpha 7 IV Full-Frame Camera + 28-70mm Lens',
    description: 'Professional full-frame 33MP hybrid mirrorless cinema camera. Includes two high-capacity batteries, 128GB v90 SD card, and padded travel case. Perfect for student documentaries, campus shoots, and photography.',
    category: 'Photography',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 1200,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
    ],
    location: 'Whitefield, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 245,
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: 'list-2',
    user_id: 'c3333333-3333-3333-3333-333333333333',
    user: DEMO_PROFILES[1], // Shraddha
    title: 'Shure SM7B Vocal Studio Dynamic Microphone + Cloudlifter CL-1',
    description: 'Legendary broadcast vocal microphone used for studio singing, voiceovers, and podcasts. Includes Cloudlifter mic activator, heavy desktop boom arm, and gold-plated XLR cable.',
    category: 'Electronics',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 550,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
      'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=800'
    ],
    location: 'Whitefield, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 180,
    created_at: '2026-11-20T12:00:00Z',
  },
  {
    id: 'list-3',
    user_id: 'c3333333-3333-3333-3333-333333333333',
    user: DEMO_PROFILES[1], // Shraddha
    title: 'Designer Embroidered Velvet Evening Gown / Festive Reception Dress',
    description: 'Exquisite deep emerald velvet gown with handcrafted antique gold zardozi embroidery. Worn once for a film festival premiere. Fits UK 8-10 / M. Dry-cleaned and ready for gala events or festive receptions.',
    category: 'Fashion & Apparel',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 900,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800'
    ],
    location: 'Whitefield, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 165,
    created_at: '2026-11-19T14:30:00Z',
  },

  // VIPAN'S LISTINGS (Oscilloscope, Soldering station, Arduino kit)
  {
    id: 'list-4',
    user_id: 'u0000000-user-0000-0000-000000000000',
    user: DEMO_PROFILES[0], // Vipan
    title: 'Rigol DS1054Z 100MHz 4-Channel Digital Storage Oscilloscope',
    description: 'Industry-standard 4-channel digital oscilloscope unlocked to 100MHz bandwidth with 24 Mpts memory depth. Includes 4 passive probes, USB cables, and original box. Essential for microcontroller debugging and power supply testing.',
    category: 'Electronics',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 450,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800'
    ],
    location: 'Koramangala 4th Block, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 310,
    created_at: '2026-11-20T16:00:00Z',
  },
  {
    id: 'list-5',
    user_id: 'u0000000-user-0000-0000-000000000000',
    user: DEMO_PROFILES[0], // Vipan
    title: 'Hakko FX-888D Professional Digital Soldering & Desoldering Station Kit',
    description: 'Authentic ESD-safe 70W digital temperature-regulated soldering station with rapid thermal recovery. Includes brass wire cleaner, 5 different chisel and bevel tips, solder wick, and lead-free 63/37 spool.',
    category: 'Tools and Equipment',
    condition: 'Excellent',
    listing_type: 'purchase',
    purchase_price: 5800,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800'
    ],
    location: 'Koramangala 4th Block, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 195,
    created_at: '2026-11-19T11:20:00Z',
  },
  {
    id: 'list-6',
    user_id: 'u0000000-user-0000-0000-000000000000',
    user: DEMO_PROFILES[0], // Vipan
    title: 'Arduino Mega 2560 Ultimate Starter Kit with 45+ Sensors & 16x2 LCD',
    description: 'Comprehensive embedded electronics kit with Arduino Mega, breadboards, jumper wires, servo motors, ultrasonic sensors, relay modules, and RFID reader. Looking to trade for high-end mechanical keyboard switches or an audio interface.',
    category: 'Computers and Accessories',
    condition: 'Like New',
    listing_type: 'trade',
    estimated_value: 3200,
    trade_desired: 'Raspberry Pi 4 / mechanical keyboard switches / USB mic',
    trade_cash_adjustment: 0,
    images: [
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800'
    ],
    location: 'Koramangala 4th Block, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 220,
    created_at: '2026-11-18T15:00:00Z',
  },

  // SHABADH'S LISTINGS (Books, Manga boxset, Fantasy novels)
  {
    id: 'list-7',
    user_id: 'd4444444-4444-4444-4444-444444444444',
    user: DEMO_PROFILES[4], // Shabadh
    title: 'Tolkien Illustrated Collector Edition 7-Book Hardcover Boxset with Maps',
    description: 'Deluxe clothbound hardcover collection with Alan Lee original illustrations, red ribbon bookmarks, and foldout Middle-earth maps. Looking to trade for sci-fi collector sets (Dune, Foundation) or graphic novels.',
    category: 'Books',
    condition: 'Like New',
    listing_type: 'trade',
    estimated_value: 4500,
    trade_desired: 'Dune Deluxe Hardcover Trilogy OR Foundation Folio Society',
    trade_cash_adjustment: 500,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=800'
    ],
    location: 'HSR Layout, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 140,
    created_at: '2026-11-19T09:15:00Z',
  },
  {
    id: 'list-8',
    user_id: 'd4444444-4444-4444-4444-444444444444',
    user: DEMO_PROFILES[4], // Shabadh
    title: 'One Piece Manga Box Set (East Blue & Baroque Works Volumes 1-23)',
    description: 'Official Viz Media box set containing the first 23 volumes of Eiichiro Oda masterpiece. Includes exclusive double-sided poster and bonus mini-comic booklet in collector carrying case.',
    category: 'Books',
    condition: 'Like New',
    listing_type: 'purchase',
    purchase_price: 8500,
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800'
    ],
    location: 'HSR Layout, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 190,
    created_at: '2026-11-18T18:40:00Z',
  },
  {
    id: 'list-9',
    user_id: 'd4444444-4444-4444-4444-444444444444',
    user: DEMO_PROFILES[4], // Shabadh
    title: 'Haruki Murakami Deluxe Hardcover Collection (Norwegian Wood, 1Q84, Kafka)',
    description: 'Beautiful 6-volume Vintage hardback set of Haruki Murakami most famous works. Pristine spine condition, kept in smoke-free glass bookshelf.',
    category: 'Books',
    condition: 'Like New',
    listing_type: 'purchase',
    purchase_price: 2900,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'
    ],
    location: 'HSR Layout, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 110,
    created_at: '2026-11-17T11:00:00Z',
  },

  // SANCHIT'S LISTINGS (Volleyball, PS5 + GTA V, Mechanical Keyboard)
  {
    id: 'list-10',
    user_id: 'a1111111-1111-1111-1111-111111111111',
    user: DEMO_PROFILES[2], // Sanchit
    title: 'Sony PlayStation 5 Console (Disc Edition) + GTA V & DualSense Controller',
    description: 'PS5 console with ultra-high-speed SSD, ray tracing, 4K 120Hz support. Preloaded with GTA V Enhanced Edition and includes two DualSense wireless controllers. Perfect for weekend gaming tournaments and friends gatherings.',
    category: 'Gaming',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 700,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'
    ],
    location: 'Indiranagar, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 520,
    created_at: '2026-11-20T14:00:00Z',
  },
  {
    id: 'list-11',
    user_id: 'a1111111-1111-1111-1111-111111111111',
    user: DEMO_PROFILES[2], // Sanchit
    title: 'Mikasa V200W Official FIVB Championship Volleyball + Asics Gel Knee Pads',
    description: 'Aerodynamic 18-panel design with dimpled microfiber surface for optimal grip and trajectory. Official tournament game ball used in Olympic volleyball. Includes matching Asics Gel volleyball knee pads.',
    category: 'Sports Equipment',
    condition: 'Like New',
    listing_type: 'purchase',
    purchase_price: 3400,
    images: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
      'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800'
    ],
    location: 'Indiranagar, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 175,
    created_at: '2026-11-19T13:10:00Z',
  },
  {
    id: 'list-12',
    user_id: 'a1111111-1111-1111-1111-111111111111',
    user: DEMO_PROFILES[2], // Sanchit
    title: 'Keychron Q1 Pro Custom Mechanical Keyboard (Gateron Brown)',
    description: 'Full CNC machined 6063 aluminum body, hot-swappable switches, wireless Bluetooth 5.1 & Type-C wired. Modded with tape mod and PORON sound-dampening foam. Looking to trade for Logitech MX Master 3S mouse or an audio interface.',
    category: 'Computers and Accessories',
    condition: 'Like New',
    listing_type: 'trade',
    estimated_value: 11500,
    trade_desired: 'Logitech MX Master 3S Mouse OR Focusrite Scarlett Solo Audio Interface',
    trade_cash_adjustment: 1500,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'
    ],
    location: 'Indiranagar, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 360,
    created_at: '2026-11-18T18:00:00Z',
  },

  // HARSHIT'S LISTINGS (MacBook, Stickers pack, Cricket bat)
  {
    id: 'list-13',
    user_id: 'b2222222-2222-2222-2222-222222222222',
    user: DEMO_PROFILES[3], // Harshit
    title: 'Apple MacBook Air M2 (16GB RAM, 512GB SSD) - Space Grey',
    description: 'Lightweight powerhouse with 18-hour battery endurance. Upgraded 16GB unified memory makes it ideal for coding hackathons, ML demos, and 4K editing. Includes MagSafe charger and protective felt sleeve.',
    category: 'Computers and Accessories',
    condition: 'Excellent',
    listing_type: 'rent',
    rental_price: 750,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'
    ],
    location: 'Koramangala, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 410,
    created_at: '2026-11-20T11:30:00Z',
  },
  {
    id: 'list-14',
    user_id: 'b2222222-2222-2222-2222-222222222222',
    user: DEMO_PROFILES[3], // Harshit
    title: 'Exclusive Holographic Developer & Cyberpunk Vinyl Stickers (Pack of 100)',
    description: 'Curated 100-piece pack of waterproof, UV-resistant holographic vinyl decals. Features Linux, Rust, GitHub, retro gaming, and cyberpunk art for laptops, skateboards, and bottles.',
    category: 'Other',
    condition: 'Brand New',
    listing_type: 'purchase',
    purchase_price: 499,
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800'
    ],
    location: 'Koramangala, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 145,
    created_at: '2026-11-19T10:00:00Z',
  },
  {
    id: 'list-15',
    user_id: 'b2222222-2222-2222-2222-222222222222',
    user: DEMO_PROFILES[3], // Harshit
    title: 'SS Ton Reserve Edition Grade-1 English Willow Cricket Bat',
    description: 'Handcrafted selected Grade 1 English willow, 1180g balanced pickup with 9 straight grains. Professionally knocked in with 15,000 mallet hits and ready to play.',
    category: 'Cricket Equipment',
    condition: 'Brand New',
    listing_type: 'trade',
    estimated_value: 14000,
    trade_desired: '27-inch 144Hz IPS Monitor OR Sony WH-1000XM4 Headphones',
    trade_cash_adjustment: 0,
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
    ],
    location: 'Koramangala, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 195,
    created_at: '2026-11-17T11:20:00Z',
  },

  // NAINA'S LISTINGS (Makeup vanity set, Dyson Styler, Modern dresses)
  {
    id: 'list-16',
    user_id: 'e5555555-5555-5555-5555-555555555555',
    user: DEMO_PROFILES[5], // Naina
    title: 'Charlotte Tilbury & Huda Beauty Deluxe Glam Makeup Vanity Kit',
    description: 'High-end cosmetic collection including Charlotte Tilbury Pillow Talk palette, Huda Beauty Empowered Eyeshadows, Rare Beauty Liquid Blush duo, and setting sprays in illuminated travel vanity box.',
    category: 'Fashion & Apparel',
    condition: 'Brand New',
    listing_type: 'purchase',
    purchase_price: 6800,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800'
    ],
    location: 'Lavelle Road, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 380,
    created_at: '2026-11-20T17:30:00Z',
  },
  {
    id: 'list-17',
    user_id: 'e5555555-5555-5555-5555-555555555555',
    user: DEMO_PROFILES[5], // Naina
    title: 'Dyson Airwrap Multi-Styler Complete Long (Nickel/Copper Edition)',
    description: 'Harnesses the Coanda effect to curl, shape, and hide flyaways with zero heat damage. Includes 30mm & 40mm long barrels, firm smoothing brush, and Prussian blue storage case. Sanitized and tested.',
    category: 'Electronics',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 850,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
    ],
    location: 'Lavelle Road, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 490,
    created_at: '2026-11-20T19:00:00Z',
  },
  {
    id: 'list-18',
    user_id: 'e5555555-5555-5555-5555-555555555555',
    user: DEMO_PROFILES[5], // Naina
    title: 'French Floral Corset Midi Summer Dress with Ribbon Lace Back',
    description: 'Chic Parisian vintage-style floral print dress with boned sweetheart corset bodice, side slit, and ribbon lace-up back. Size Small (fits UK 6-8). Ideal for brunch, sundowners, or garden parties.',
    category: 'Fashion & Apparel',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 400,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    location: 'Lavelle Road, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 215,
    created_at: '2026-11-19T16:20:00Z',
  },

  // JAVED BHAIYA'S LISTINGS (Drones, Drone parts, Transmitter controllers)
  {
    id: 'list-19',
    user_id: 'f6666666-6666-6666-6666-666666666666',
    user: DEMO_PROFILES[6], // Javed Bhaiya
    title: 'Custom 5-inch 6S Carbon Fiber FPV Racing & Freestyle Drone (BNF)',
    description: 'Apex 5-inch 3K full carbon fiber frame built with T-Motor F60 Pro V 1950KV brushless motors, Caddx Ratel 2 Starlight camera, and ExpressLRS 2.4GHz receiver. Tuned on Betaflight 4.4 for cinematic acrobatics.',
    category: 'Electronics',
    condition: 'Like New',
    listing_type: 'rent',
    rental_price: 1100,
    rental_duration: 'Daily',
    availability_status: 'available',
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'
    ],
    location: 'Frazer Town, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 390,
    created_at: '2026-11-20T15:45:00Z',
  },
  {
    id: 'list-20',
    user_id: 'f6666666-6666-6666-6666-666666666666',
    user: DEMO_PROFILES[6], // Javed Bhaiya
    title: 'SpeedyBee F405 V4 Flight Controller + 55A BLHeli_S 4-in-1 ESC Stack',
    description: 'High-performance drone flight stack featuring built-in Bluetooth/WiFi for wireless phone tuning via SpeedyBee App, onboard 4-level battery indicator, 4000uF filtering capacitor, and DJI Air Unit plug.',
    category: 'Electronics',
    condition: 'Brand New',
    listing_type: 'purchase',
    purchase_price: 5400,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'
    ],
    location: 'Frazer Town, Bengaluru',
    status: 'active',
    featured: false,
    view_count: 210,
    created_at: '2026-11-19T17:15:00Z',
  },
  {
    id: 'list-21',
    user_id: 'f6666666-6666-6666-6666-666666666666',
    user: DEMO_PROFILES[6], // Javed Bhaiya
    title: 'RadioMaster TX16S Mark II Multi-Protocol Radio Transmitter Controller',
    description: 'Hall sensor V4.0 gimbals, 4.3-inch color touch screen display, EdgeTX firmware, with integrated 4-in-1 multi-protocol RF module. Compatible with FrSky, FlySky, Futaba, and TBS Crossfire modules.',
    category: 'Gaming',
    condition: 'Like New',
    listing_type: 'trade',
    estimated_value: 16500,
    trade_desired: 'DJI Goggles V2 / FPV video receiver gear / GoPro Hero 11 Black',
    trade_cash_adjustment: 0,
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800'
    ],
    location: 'Frazer Town, Bengaluru',
    status: 'active',
    featured: true,
    view_count: 340,
    created_at: '2026-11-18T19:30:00Z',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    listing_id: 'list-12',
    listing: INITIAL_LISTINGS[11], // Sanchit's Keychron Q1 Pro
    participant1_id: CURRENT_USER.id,
    participant1: CURRENT_USER,
    participant2_id: 'a1111111-1111-1111-1111-111111111111',
    participant2: DEMO_PROFILES[2], // Sanchit
    subject: 'Trade proposal for Keychron Q1 Pro',
    last_message_text: 'I can offer my Logitech MX Master 3S plus ₹1,200 cash difference!',
    last_message_at: '2026-11-20T14:10:00Z',
    unread_count: 1,
  },
  {
    id: 'conv-2',
    listing_id: 'list-1',
    listing: INITIAL_LISTINGS[0], // Shraddha's Sony A7 IV
    participant1_id: CURRENT_USER.id,
    participant1: CURRENT_USER,
    participant2_id: 'c3333333-3333-3333-3333-333333333333',
    participant2: DEMO_PROFILES[1], // Shraddha
    subject: 'Weekend Rental for Sony A7 IV',
    last_message_text: 'Hi Shraddha, I have submitted a 2-day rental booking for ₹2,400 this weekend.',
    last_message_at: '2026-11-20T11:05:00Z',
    unread_count: 0,
  },
  {
    id: 'conv-3',
    listing_id: 'list-17',
    listing: INITIAL_LISTINGS[16], // Naina's Dyson Airwrap
    participant1_id: CURRENT_USER.id,
    participant1: CURRENT_USER,
    participant2_id: 'e5555555-5555-5555-5555-555555555555',
    participant2: DEMO_PROFILES[5], // Naina
    subject: 'Rental inquiry for Dyson Airwrap',
    last_message_text: 'Hi Naina, looking to rent the Dyson Airwrap for Saturday evening event.',
    last_message_at: '2026-11-20T16:20:00Z',
    unread_count: 1,
  },
  {
    id: 'conv-4',
    listing_id: 'list-19',
    listing: INITIAL_LISTINGS[18], // Javed Bhaiya's FPV Drone
    participant1_id: CURRENT_USER.id,
    participant1: CURRENT_USER,
    participant2_id: 'f6666666-6666-6666-6666-666666666666',
    participant2: DEMO_PROFILES[6], // Javed Bhaiya
    subject: 'Custom 5-inch FPV Drone Rental & Flight Test',
    last_message_text: 'Javed Bhaiya, does the drone come bound to ExpressLRS 2.4GHz?',
    last_message_at: '2026-11-20T17:45:00Z',
    unread_count: 0,
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-101',
      conversation_id: 'conv-1',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Hey Sanchit! Loved your Keychron Q1 Pro listing. Are you interested in trading for my pristine MX Master 3S in graphite?',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T13:45:00Z',
    },
    {
      id: 'msg-102',
      conversation_id: 'conv-1',
      sender_id: 'a1111111-1111-1111-1111-111111111111',
      sender: DEMO_PROFILES[2], // Sanchit
      content: 'Hi Vipan! Yes definitely interested! The keyboard has lubed switches. How old is the mouse, and would you be open to adding ₹1,200 cash adjustment?',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T13:58:00Z',
    },
    {
      id: 'msg-103',
      conversation_id: 'conv-1',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'I can offer my Logitech MX Master 3S plus ₹1,200 cash difference!',
      message_type: 'trade_offer',
      metadata: {
        offeredItem: 'Logitech MX Master 3S (Graphite)',
        estimatedValue: 7500,
        cashAdjustment: 1200,
        status: 'pending'
      },
      is_read: false,
      created_at: '2026-11-20T14:10:00Z',
    },
  ],
  'conv-2': [
    {
      id: 'msg-201',
      conversation_id: 'conv-2',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Hi Shraddha, looking to rent your Sony A7 IV for a 2-day student documentary shoot this Saturday and Sunday.',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T10:30:00Z',
    },
    {
      id: 'msg-202',
      conversation_id: 'conv-2',
      sender_id: 'c3333333-3333-3333-3333-333333333333',
      sender: DEMO_PROFILES[1], // Shraddha
      content: 'Hey Vipan, sounds great! It is available this weekend. I can include both original batteries, 128GB SD card, and the charger.',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T10:45:00Z',
    },
    {
      id: 'msg-203',
      conversation_id: 'conv-2',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Awesome! I have submitted a 2-day rental reservation proposal for ₹2,400.',
      message_type: 'rental_offer',
      metadata: {
        totalAmount: 2400,
        durationUnits: 2,
        durationType: 'Daily',
        startDate: '2026-11-22',
        endDate: '2026-11-24',
        status: 'pending'
      },
      is_read: true,
      created_at: '2026-11-20T11:00:00Z',
    },
  ],
  'conv-3': [
    {
      id: 'msg-301',
      conversation_id: 'conv-3',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Hi Naina, looking to rent the Dyson Airwrap for an event this Saturday. Is it available for pickup in Lavelle Road?',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T16:00:00Z',
    },
    {
      id: 'msg-302',
      conversation_id: 'conv-3',
      sender_id: 'e5555555-5555-5555-5555-555555555555',
      sender: DEMO_PROFILES[5], // Naina
      content: 'Hey Vipan! Yes, absolutely. All attachments are sanitized and ready. You can submit the 1-day rental request here!',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T16:15:00Z',
    },
    {
      id: 'msg-303',
      conversation_id: 'conv-3',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Requesting 1-day rental for Dyson Airwrap styler.',
      message_type: 'rental_offer',
      metadata: {
        totalAmount: 850,
        durationUnits: 1,
        durationType: 'Daily',
        startDate: '2026-11-22',
        endDate: '2026-11-23',
        status: 'pending'
      },
      is_read: false,
      created_at: '2026-11-20T16:20:00Z',
    },
  ],
  'conv-4': [
    {
      id: 'msg-401',
      conversation_id: 'conv-4',
      sender_id: CURRENT_USER.id,
      sender: CURRENT_USER,
      content: 'Salam Javed Bhaiya! Love your custom 5-inch 6S Apex drone build. Does it come bound to an ExpressLRS 2.4GHz receiver?',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T17:30:00Z',
    },
    {
      id: 'msg-402',
      conversation_id: 'conv-4',
      sender_id: 'f6666666-6666-6666-6666-666666666666',
      sender: DEMO_PROFILES[6], // Javed Bhaiya
      content: 'Walekum Assalam Vipan bhai! Haan, ELRS 2.4GHz pre-configured hai with Betaflight 4.4. 2 extra sets of Gemfan props bhi de dunga for testing!',
      message_type: 'text',
      is_read: true,
      created_at: '2026-11-20T17:40:00Z',
    },
  ],
};

export const INITIAL_TRADE_OFFERS: TradeOffer[] = [
  {
    id: 'trade-offer-1',
    listing_id: 'list-12',
    listing: INITIAL_LISTINGS[11],
    requester_id: CURRENT_USER.id,
    requester: CURRENT_USER,
    owner_id: 'a1111111-1111-1111-1111-111111111111',
    offered_item_title: 'Logitech MX Master 3S Ergonomic Mouse',
    offered_item_description: 'Used for 3 months with original box, quiet click switches, MagSpeed wheel.',
    offered_item_image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
    offered_item_value: 7500,
    cash_adjustment: 1200,
    status: 'pending',
    negotiation_notes: 'Willing to meet at Indiranagar metro station for handover.',
    created_at: '2026-11-20T14:10:00Z',
  },
];

export const INITIAL_RENTAL_REQUESTS: RentalRequest[] = [
  {
    id: 'rent-req-1',
    listing_id: 'list-1',
    listing: INITIAL_LISTINGS[0],
    renter_id: CURRENT_USER.id,
    renter: CURRENT_USER,
    owner_id: 'c3333333-3333-3333-3333-333333333333',
    start_date: '2026-11-22',
    end_date: '2026-11-24',
    duration_type: 'Daily',
    duration_units: 2,
    total_amount: 2400,
    status: 'pending',
    message: 'Short campus film shoot. Will carry ID verification and handle with care.',
    created_at: '2026-11-20T11:00:00Z',
  },
  {
    id: 'rent-req-2',
    listing_id: 'list-17',
    listing: INITIAL_LISTINGS[16],
    renter_id: CURRENT_USER.id,
    renter: CURRENT_USER,
    owner_id: 'e5555555-5555-5555-5555-555555555555',
    start_date: '2026-11-22',
    end_date: '2026-11-23',
    duration_type: 'Daily',
    duration_units: 1,
    total_amount: 850,
    status: 'pending',
    message: 'Special dinner occasion styling. Returning Sunday morning.',
    created_at: '2026-11-20T16:20:00Z',
  },
];

export const INITIAL_PURCHASES: PurchaseTransaction[] = [
  {
    id: 'purch-1',
    listing_id: 'list-5',
    listing: INITIAL_LISTINGS[4],
    buyer_id: 'b2222222-2222-2222-2222-222222222222',
    buyer: DEMO_PROFILES[3], // Harshit
    seller_id: CURRENT_USER.id,
    seller: CURRENT_USER,
    amount: 5800,
    status: 'completed',
    payment_method: 'DEMO UPI / CARD (Hackathon Mode)',
    receipt_number: 'NRM-2026-DEMO-8912',
    shipping_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
    created_at: '2026-11-19T16:20:00Z',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    reviewer_id: 'a1111111-1111-1111-1111-111111111111',
    reviewer: DEMO_PROFILES[2], // Sanchit
    target_user_id: 'c3333333-3333-3333-3333-333333333333',
    listing_id: 'list-1',
    rating: 5,
    comment: 'Super smooth Sony camera rental from Shraddha! Equipment was spotless and packed in professional case.',
    created_at: '2026-11-18T12:00:00Z',
  },
  {
    id: 'rev-2',
    reviewer_id: 'b2222222-2222-2222-2222-222222222222',
    reviewer: DEMO_PROFILES[3], // Harshit
    target_user_id: CURRENT_USER.id,
    listing_id: 'list-5',
    rating: 5,
    comment: 'Great soldering kit from Vipan! Immediate handover and excellent condition.',
    created_at: '2026-11-19T17:00:00Z',
  },
  {
    id: 'rev-3',
    reviewer_id: 'e5555555-5555-5555-5555-555555555555',
    reviewer: DEMO_PROFILES[5], // Naina
    target_user_id: 'f6666666-6666-6666-6666-666666666666',
    listing_id: 'list-19',
    rating: 5,
    comment: 'Javed Bhaiya custom drone build is phenomenal! Excellent aerial shots for our fashion shoot.',
    created_at: '2026-11-19T19:30:00Z',
  },
];

export const INITIAL_COMMUNITY_REQUESTS: CommunityRequest[] = [
  {
    id: 'req-1',
    user_id: 'a1111111-1111-1111-1111-111111111111',
    user: DEMO_PROFILES[2], // Sanchit
    item_name: 'Raspberry Pi 4 Model B (4GB or 8GB)',
    category: 'Computers and Accessories',
    listing_type: 'rent',
    details: 'Need for 1 week to test an IoT gaming leaderboard before deployment. Clean returns guaranteed.',
    created_at: '2026-11-18T14:20:00Z',
  },
  {
    id: 'req-2',
    user_id: 'b2222222-2222-2222-2222-222222222222',
    user: DEMO_PROFILES[3], // Harshit
    item_name: 'GoPro Hero 11 or 12 Black with Chest Mount',
    category: 'Photography',
    listing_type: 'rent',
    details: 'Looking for a weekend rental for a Coorg cycling expedition. Can pay upfront security deposit.',
    created_at: '2026-11-19T09:15:00Z',
  },
  {
    id: 'req-3',
    user_id: 'c3333333-3333-3333-3333-333333333333',
    user: DEMO_PROFILES[1], // Shraddha
    item_name: 'Wireless Studio Lavalier Mic (Rode Wireless PRO or DJI Mic 2)',
    category: 'Electronics',
    listing_type: 'rent',
    details: 'Needed for outdoor documentary interview shoot in Whitefield.',
    created_at: '2026-11-20T08:30:00Z',
  },
  {
    id: 'req-4',
    user_id: 'e5555555-5555-5555-5555-555555555555',
    user: DEMO_PROFILES[5], // Naina
    item_name: 'Designer Gold Clutch Purse / Handbag for Reception',
    category: 'Other',
    listing_type: 'rent',
    details: 'Looking for a metallic gold or champagne clutch for this Sunday evening.',
    created_at: '2026-11-20T11:45:00Z',
  },
  {
    id: 'req-5',
    user_id: 'f6666666-6666-6666-6666-666666666666',
    user: DEMO_PROFILES[6], // Javed Bhaiya
    item_name: '6S 1300mAh - 1500mAh 120C LiPo Drone Batteries (2-3 packs)',
    category: 'Electronics',
    listing_type: 'trade',
    details: 'Looking to trade some extra 5-inch carbon fiber props or flight cables for fresh 6S LiPo packs.',
    created_at: '2026-11-20T14:10:00Z',
  },
];
