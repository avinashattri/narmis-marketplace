# NARMIS — Things Have More Than One Life

> **Peer-to-Peer Marketplace Platform**  
> **Core Philosophy:** RENT. TRADE. PURCHASE.  
> **Brand Tagline:** *Things have more than one life.*

---

## 🏰 About NARMIS

**NARMIS** is a full-stack peer-to-peer circular marketplace built around a foundational principle: things have more than one life. Many high-value products—cameras, mechanical keyboards, laptops, sports equipment, power tools, and books—remain unused in closets while others in the neighborhood need them. 

NARMIS connects communities through three distinct transaction modes, promoting circular sustainability, accessibility, and local trust.

---

## 🎨 Visual Identity & Design System

Inspired by cinematic mountain castles and warm parchment landscapes:

- **Primary Background (Dark Forest Green):** `#142523`
- **Secondary Surface:** `#1D302C`
- **Mountain Green:** `#304943`
- **Parchment Beige:** `#EAD3AA`
- **Light Cream:** `#F5E9D2`
- **Antique Gold:** `#B88A4A`
- **Muted Brown:** `#80674D`
- **Charcoal:** `#202724`

### Typography
- **Headings & Promotional Typography:** *Playfair Display* & *Cormorant Garamond* (Elegant Serif)
- **Body & Interface:** *Inter* (Clean Modern Sans-Serif)

### Text Logo
- Simple, bold, and distinct uppercase typography: **`NARMIS`**

---

## 🚀 The Three Core Features

### 1. 📅 RENT
- Users can list equipment they own and rent it out to verified peers.
- Flexible durations: **Hourly**, **Daily**, or **Weekly**.
- Real-time availability status and direct chat reservation inquiry.
- Built-in deposit and term guidance.

### 2. 🔄 TRADE
- Item-for-item barter mechanism.
- Enter estimated value for both items.
- Dynamic **Value Difference Calculator** and **Cash Adjustment Offsets** (e.g., *Mouse + ₹500 for Keyboard*).
- **Explicit Mutual Approval** required from both parties.
- Real-time negotiation via in-app chat.

### 3. 🛍️ PURCHASE
- Outright purchase for pre-loved, verified items.
- Transparent INR pricing with condition grading (*Brand New*, *Like New*, *Excellent*, *Good*, *Fair*).
- **Simulated Demo Checkout** with instant order summaries, receipt generation (`NRM-XXXX`), and confetti feedback.

---

## 🎭 Editorial Cartoon Illustration System

Custom hand-crafted vector character illustrations throughout the platform:
- 💻 Person renting out a laptop
- ⌨️ Two people exchanging keyboards
- 🏏 Cricket enthusiast purchasing an English Willow bat
- 🎾 Athlete renting a tennis racket
- 🎧 Audio enthusiast selling noise-cancelling headphones
- 📚 Two people trading deluxe hardcover books
- 📷 Photographer renting out a full-frame camera
- 🎮 Gamer purchasing console accessories

---

## 🗺️ Application Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Cinematic multi-layer parallax hero, feature showcase, and trending items |
| `/explore` | All Listings | Central exploration hub with search, 10 categories, condition & price filters |
| `/rent` | Rental Marketplace | Dedicated rentals feed with duration & rate selectors |
| `/trade` | Trade Marketplace | Exchange portal with value gap & cash offset features |
| `/purchase` | Purchase Store | Direct purchase marketplace with demo checkout |
| `/product/:id` | Product Details | Multi-image gallery, seller card, and dynamic action modal |
| `/create-listing` | Unified Wizard | 3-step listing creation (Photos, Info, Conditional Model Fields) |
| `/messages` | In-App Messaging | Two-panel live chat with linked product preview & trade cards |
| `/dashboard` | User Dashboard | Overview stats, active listings, rentals, trade offers, and purchases |
| `/profile/:id` | Public Profile | Member reputation, rating, reviews, and active listings |
| `/login` | Authentication | Supabase sign-in with instant 1-click Demo Account login |
| `/signup` | Registration | New user onboarding with automatic profile creation |
| `/about` | About NARMIS | Brand philosophy, circular vision, and mission |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite 6** (Fast HMR & code splitting)
- **Tailwind CSS** (Custom palette & responsive typography)
- **Framer Motion** (Multi-layer scroll parallax & micro-interactions)
- **React Router 7** (SPA client-side routing)
- **Lucide React** (Consistent iconography)
- **Canvas Confetti** (Checkout delight)

### Backend & Database
- **Supabase** (PostgreSQL 15)
- **Row Level Security (RLS)** for strict data ownership
- **Supabase Realtime** for instant messaging
- **Supabase Storage** for user upload buckets
- Dual-mode resilient store (Seamless local state cache + Supabase sync)

---

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/avinashattri/narmis-marketplace.git
cd narmis-marketplace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> *Note: NARMIS comes with an automatic resilient local demo store. If credentials are not supplied, the app works 100% out of the box for hackathon demonstration.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 🗄️ Database Setup & Migrations (Supabase)

To link with a live Supabase project:
1. Open your Supabase SQL Editor.
2. Execute `supabase/migrations/20261119_initial_schema.sql` to create all 10 tables, triggers, and Row Level Security policies.
3. Execute `supabase/seed.sql` to seed initial demo listings, profiles, and reviews.

---

## 🏆 Hackathon Notes
- **Demo Payments:** All checkout transactions are simulated demo purchases (`DEMO_PAYMENT_HACKATHON`). No actual cards or funds are debited.
- **Demo Account:** Quick login available on `/login` to test as *Kabir Das* with pre-loaded listings, trade offers, and messages.

---

## 📄 License
MIT © 2026 NARMIS. Things have more than one life.
