import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

// 1. A PERSON RENTING OUT A LAPTOP
export const LaptopRentalIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background glow */}
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.25" />
    <ellipse cx="120" cy="210" rx="75" ry="12" fill="#142523" fillOpacity="0.3" />

    {/* Body / Torso - Forest Green Jacket */}
    <path d="M75 200 C75 160 85 140 120 140 C155 140 165 160 165 200 Z" fill="#304943" />
    {/* Terracotta Inner Collar */}
    <path d="M108 140 L120 158 L132 140 Z" fill="#D97A53" />

    {/* Head & Face */}
    <circle cx="120" cy="100" r="32" fill="#F5E9D2" />
    {/* Hair - Dark Charcoal */}
    <path d="M92 95 C92 70 105 65 120 65 C135 65 148 70 148 95 C148 85 138 80 120 80 C102 80 92 85 92 95 Z" fill="#202724" />
    {/* Cheerful Eyes & Smile */}
    <circle cx="110" cy="98" r="3.5" fill="#202724" />
    <circle cx="130" cy="98" r="3.5" fill="#202724" />
    <path d="M112 110 Q120 118 128 110" stroke="#80674D" strokeWidth="2.5" strokeLinecap="round" />
    {/* Rosy Cheeks */}
    <circle cx="104" cy="106" r="4" fill="#D97A53" fillOpacity="0.4" />
    <circle cx="136" cy="106" r="4" fill="#D97A53" fillOpacity="0.4" />

    {/* Arms holding Laptop Forward */}
    <path d="M78 165 Q60 185 85 190" stroke="#F5E9D2" strokeWidth="12" strokeLinecap="round" />
    <path d="M162 165 Q180 185 155 190" stroke="#F5E9D2" strokeWidth="12" strokeLinecap="round" />

    {/* Laptop Base & Screen (Presented to Renter) */}
    <g transform="translate(68, 150)">
      {/* Laptop Screen */}
      <rect x="18" y="0" width="68" height="42" rx="4" fill="#202724" stroke="#EAD3AA" strokeWidth="2" />
      <rect x="22" y="4" width="60" height="34" rx="2" fill="#1D302C" />
      {/* Code / Screen graphic */}
      <rect x="28" y="12" width="28" height="4" rx="2" fill="#EAD3AA" />
      <rect x="28" y="20" width="44" height="3" rx="1.5" fill="#B88A4A" />
      <rect x="28" y="26" width="36" height="3" rx="1.5" fill="#F5E9D2" />
      {/* Laptop Keyboard Deck */}
      <polygon points="10,42 94,42 104,56 0,56" fill="#80674D" stroke="#B88A4A" strokeWidth="1.5" />
      <rect x="42" y="50" width="20" height="4" rx="1" fill="#202724" />
    </g>

    {/* Rental Tag / Badge Floating */}
    <g transform="translate(155, 60)">
      <rect x="0" y="0" width="58" height="26" rx="13" fill="#B88A4A" stroke="#F5E9D2" strokeWidth="1.5" />
      <text x="29" y="17" fill="#142523" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹750/d</text>
    </g>
  </svg>
);

// 2. TWO PEOPLE EXCHANGING KEYBOARDS (TRADE)
export const KeyboardTradeIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background Circle */}
    <circle cx="130" cy="110" r="95" fill="#EAD3AA" fillOpacity="0.2" />
    <ellipse cx="130" cy="200" rx="90" ry="10" fill="#142523" fillOpacity="0.3" />

    {/* Left Person (Terracotta Sweater) */}
    <path d="M40 195 C40 160 50 145 75 145 C100 145 105 160 105 195 Z" fill="#D97A53" />
    <circle cx="75" cy="110" r="24" fill="#F5E9D2" />
    {/* Hair Left */}
    <path d="M55 105 C55 85 65 80 80 80 C95 80 98 90 98 105 C90 95 70 95 55 105 Z" fill="#80674D" />
    <circle cx="82" cy="108" r="2.5" fill="#202724" />
    <path d="M78 118 Q84 124 90 118" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Right Person (Mountain Green Coat) */}
    <path d="M155 195 C155 160 160 145 185 145 C210 145 220 160 220 195 Z" fill="#304943" />
    <circle cx="185" cy="110" r="24" fill="#F5E9D2" />
    {/* Hair Right */}
    <path d="M165 105 C165 85 175 80 190 80 C205 80 208 90 208 105 C200 95 180 95 165 105 Z" fill="#202724" />
    <circle cx="178" cy="108" r="2.5" fill="#202724" />
    <path d="M172 118 Q178 124 184 118" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Exchange Curved Arrows in center */}
    <g transform="translate(112, 50)">
      <path d="M0 16 C10 0 26 0 36 14" stroke="#B88A4A" strokeWidth="3" strokeLinecap="round" />
      <polygon points="38,16 35,8 27,12" fill="#B88A4A" />
      <path d="M36 28 C26 44 10 44 0 30" stroke="#B88A4A" strokeWidth="3" strokeLinecap="round" />
      <polygon points="-2,28 1,36 9,32" fill="#B88A4A" />
    </g>

    {/* Keyboards Being Exchanged */}
    {/* Keyboard 1 (Custom Brass/Gold) */}
    <g transform="translate(75, 145) rotate(6)">
      <rect x="0" y="0" width="55" height="24" rx="4" fill="#B88A4A" stroke="#EAD3AA" strokeWidth="1.5" />
      <rect x="4" y="4" width="47" height="16" rx="2" fill="#202724" />
      {/* Keycaps */}
      <rect x="7" y="6" width="6" height="5" rx="1" fill="#F5E9D2" />
      <rect x="15" y="6" width="6" height="5" rx="1" fill="#F5E9D2" />
      <rect x="23" y="6" width="6" height="5" rx="1" fill="#F5E9D2" />
      <rect x="31" y="6" width="6" height="5" rx="1" fill="#D97A53" />
      <rect x="12" y="13" width="26" height="5" rx="1" fill="#EAD3AA" />
    </g>

    {/* Keyboard 2 (Graphite/Charcoal) */}
    <g transform="translate(130, 150) rotate(-6)">
      <rect x="0" y="0" width="55" height="24" rx="4" fill="#202724" stroke="#B88A4A" strokeWidth="1.5" />
      <rect x="4" y="4" width="47" height="16" rx="2" fill="#142523" />
      <rect x="7" y="6" width="6" height="5" rx="1" fill="#EAD3AA" />
      <rect x="15" y="6" width="6" height="5" rx="1" fill="#EAD3AA" />
      <rect x="23" y="6" width="6" height="5" rx="1" fill="#D97A53" />
      <rect x="14" y="13" width="24" height="5" rx="1" fill="#F5E9D2" />
    </g>
  </svg>
);

// 3. SOMEONE BUYING A CRICKET BAT (PURCHASE)
export const CricketPurchaseIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.25" />
    <ellipse cx="120" cy="215" rx="75" ry="10" fill="#142523" fillOpacity="0.3" />

    {/* Body - Cream Polo Shirt with Forest details */}
    <path d="M80 205 C80 165 90 145 125 145 C155 145 165 165 165 205 Z" fill="#F5E9D2" />
    <path d="M115 145 L125 162 L135 145 Z" fill="#304943" />

    {/* Character Head */}
    <circle cx="125" cy="100" r="30" fill="#F5E9D2" />
    {/* Cap / Helmet */}
    <path d="M96 95 C96 72 108 68 128 68 C148 68 156 75 156 95 C146 88 116 88 96 95 Z" fill="#304943" />
    <path d="M125 78 L165 82 L155 88 L125 84 Z" fill="#B88A4A" />
    {/* Eyes & Smile */}
    <circle cx="132" cy="100" r="3.5" fill="#202724" />
    <circle cx="146" cy="100" r="3.5" fill="#202724" />
    <path d="M134 112 Q142 118 150 112" stroke="#80674D" strokeWidth="2.5" strokeLinecap="round" />

    {/* Full English Willow Cricket Bat proudly rested on shoulder */}
    <g transform="translate(62, 50) rotate(-22)">
      {/* Handle with White/Rubber Grip */}
      <rect x="20" y="0" width="12" height="42" rx="3" fill="#F5E9D2" stroke="#80674D" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="32" y2="12" stroke="#D97A53" strokeWidth="1.5" />
      <line x1="20" y1="24" x2="32" y2="24" stroke="#D97A53" strokeWidth="1.5" />
      {/* Wooden Blade */}
      <path d="M14 42 C14 40 38 40 38 42 L38 125 C38 135 14 135 14 125 Z" fill="#EAD3AA" stroke="#80674D" strokeWidth="2" />
      {/* Wood Grains */}
      <line x1="20" y1="46" x2="20" y2="120" stroke="#80674D" strokeWidth="1" opacity="0.4" />
      <line x1="26" y1="44" x2="26" y2="124" stroke="#80674D" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="46" x2="32" y2="120" stroke="#80674D" strokeWidth="1" opacity="0.4" />
      {/* Brand Sticker */}
      <rect x="18" y="60" width="16" height="28" rx="2" fill="#D97A53" />
      <text x="26" y="78" fill="#F5E9D2" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SS</text>
    </g>

    {/* Red Leather Cricket Ball in Hand */}
    <circle cx="68" cy="165" r="14" fill="#B83A3A" stroke="#F5E9D2" strokeWidth="2" />
    <path d="M58 165 C64 160 72 170 78 165" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2,2" />

    {/* Price Tag Badge */}
    <g transform="translate(150, 140)">
      <rect x="0" y="0" width="65" height="28" rx="14" fill="#142523" stroke="#B88A4A" strokeWidth="2" />
      <text x="32" y="19" fill="#EAD3AA" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹14,000</text>
    </g>
  </svg>
);

// 4. A PERSON RENTING A TENNIS RACKET
export const TennisRentalIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.2" />
    <ellipse cx="120" cy="210" rx="75" ry="10" fill="#142523" fillOpacity="0.3" />

    {/* Character with Headband & Sporty Jacket */}
    <path d="M75 200 C75 160 85 140 120 140 C155 140 165 160 165 200 Z" fill="#304943" />
    <circle cx="120" cy="100" r="30" fill="#F5E9D2" />
    {/* Terracotta Sport Headband */}
    <rect x="90" y="88" width="60" height="10" rx="4" fill="#D97A53" />
    {/* Dark Hair */}
    <path d="M94 88 C94 65 106 62 120 62 C134 62 146 65 146 88 Z" fill="#202724" />
    <circle cx="112" cy="104" r="3" fill="#202724" />
    <circle cx="128" cy="104" r="3" fill="#202724" />
    <path d="M114 116 Q120 122 126 116" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Wilson Pro Tennis Racket */}
    <g transform="translate(140, 50) rotate(15)">
      {/* Handle */}
      <rect x="20" y="65" width="8" height="60" rx="3" fill="#202724" stroke="#B88A4A" strokeWidth="1" />
      {/* Shaft */}
      <path d="M21 65 L16 48 L32 48 L27 65 Z" fill="#D97A53" />
      {/* Oval Frame */}
      <ellipse cx="24" cy="26" rx="22" ry="26" stroke="#D97A53" strokeWidth="4" fill="none" />
      {/* Strings Grid */}
      <line x1="12" y1="26" x2="36" y2="26" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
      <line x1="14" y1="16" x2="34" y2="16" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
      <line x1="14" y1="36" x2="34" y2="36" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
      <line x1="24" y1="6" x2="24" y2="46" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
      <line x1="18" y1="8" x2="18" y2="44" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
      <line x1="30" y1="8" x2="30" y2="44" stroke="#EAD3AA" strokeWidth="1" opacity="0.8" />
    </g>

    {/* Tennis Ball */}
    <circle cx="65" cy="140" r="14" fill="#C8D400" stroke="#1D302C" strokeWidth="1.5" />
    <path d="M56 140 C60 134 68 146 74 140" stroke="#FFFFFF" strokeWidth="1.5" />

    <g transform="translate(40, 60)">
      <rect x="0" y="0" width="60" height="24" rx="12" fill="#B88A4A" />
      <text x="30" y="16" fill="#142523" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹350/d</text>
    </g>
  </svg>
);

// 5. SOMEONE SELLING HEADPHONES
export const HeadphoneSaleIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.25" />
    <ellipse cx="120" cy="210" rx="75" ry="10" fill="#142523" fillOpacity="0.3" />

    <path d="M75 200 C75 160 85 145 120 145 C155 145 165 160 165 200 Z" fill="#202724" />
    <circle cx="120" cy="100" r="30" fill="#F5E9D2" />
    {/* Hair */}
    <path d="M92 90 C92 70 105 65 120 65 C135 65 148 70 148 90 Z" fill="#80674D" />
    <circle cx="112" cy="102" r="3" fill="#202724" />
    <circle cx="128" cy="102" r="3" fill="#202724" />
    <path d="M114 114 Q120 120 126 114" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Holding Premium Sony Noise Cancelling Over-Ear Headphones */}
    <g transform="translate(85, 135)">
      {/* Headband arch */}
      <path d="M10 20 C10 -5 60 -5 60 20" stroke="#EAD3AA" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Ear Cups */}
      <rect x="2" y="15" width="16" height="24" rx="8" fill="#F5E9D2" stroke="#B88A4A" strokeWidth="2" />
      <rect x="52" y="15" width="16" height="24" rx="8" fill="#F5E9D2" stroke="#B88A4A" strokeWidth="2" />
      {/* Cushion Padding */}
      <rect x="15" y="18" width="5" height="18" rx="2" fill="#304943" />
      <rect x="50" y="18" width="5" height="18" rx="2" fill="#304943" />
    </g>

    {/* Certified Pre-Loved Tag */}
    <g transform="translate(145, 65)">
      <rect x="0" y="0" width="70" height="24" rx="12" fill="#304943" stroke="#EAD3AA" strokeWidth="1.5" />
      <text x="35" y="16" fill="#F5E9D2" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">FOR SALE</text>
    </g>
  </svg>
);

// 6. TWO PEOPLE EXCHANGING BOOKS
export const BookExchangeIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="130" cy="110" r="95" fill="#EAD3AA" fillOpacity="0.2" />
    <ellipse cx="130" cy="200" rx="90" ry="10" fill="#142523" fillOpacity="0.3" />

    {/* Person 1 Left */}
    <path d="M45 195 C45 160 55 145 80 145 C105 145 110 160 110 195 Z" fill="#80674D" />
    <circle cx="80" cy="110" r="24" fill="#F5E9D2" />
    <circle cx="86" cy="110" r="2.5" fill="#202724" />
    <path d="M82 118 Q88 124 94 118" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Person 2 Right */}
    <path d="M150 195 C150 160 155 145 180 145 C205 145 215 160 215 195 Z" fill="#D97A53" />
    <circle cx="180" cy="110" r="24" fill="#F5E9D2" />
    <circle cx="174" cy="110" r="2.5" fill="#202724" />
    <path d="M168 118 Q174 124 180 118" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Books Meeting in the middle */}
    {/* Book 1 (Tolkien Forest Green Hardcover) */}
    <g transform="translate(85, 135) rotate(12)">
      <rect x="0" y="0" width="36" height="48" rx="3" fill="#1D302C" stroke="#B88A4A" strokeWidth="2" />
      <rect x="30" y="4" width="4" height="40" fill="#EAD3AA" />
      <polygon points="12,18 24,18 18,28" fill="#B88A4A" />
    </g>

    {/* Book 2 (Dune Terracotta Hardcover) */}
    <g transform="translate(135, 135) rotate(-12)">
      <rect x="0" y="0" width="36" height="48" rx="3" fill="#D97A53" stroke="#F5E9D2" strokeWidth="2" />
      <rect x="2" y="4" width="4" height="40" fill="#EAD3AA" />
      <circle cx="18" cy="24" r="7" fill="#B88A4A" />
    </g>

    {/* Trade Sparkle Icons */}
    <g transform="translate(122, 90)">
      <polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill="#B88A4A" />
    </g>
  </svg>
);

// 7. SOMEONE OFFERING A CAMERA FOR RENT
export const CameraRentalIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.25" />
    <ellipse cx="120" cy="210" rx="75" ry="10" fill="#142523" fillOpacity="0.3" />

    <path d="M75 200 C75 160 85 140 120 140 C155 140 165 160 165 200 Z" fill="#1D302C" />
    <circle cx="120" cy="100" r="30" fill="#F5E9D2" />
    {/* Photographer Beret */}
    <ellipse cx="120" cy="74" rx="32" ry="14" fill="#80674D" />
    <circle cx="120" cy="62" r="3" fill="#B88A4A" />
    <circle cx="112" cy="102" r="3" fill="#202724" />
    <circle cx="128" cy="102" r="3" fill="#202724" />
    <path d="M114 114 Q120 120 126 114" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* DSLR / Mirrorless Camera Body & Lens */}
    <g transform="translate(75, 140)">
      {/* Body */}
      <rect x="10" y="12" width="70" height="44" rx="6" fill="#202724" stroke="#B88A4A" strokeWidth="2" />
      {/* Top Prism Viewfinder */}
      <polygon points="36,12 45,4 55,12" fill="#202724" stroke="#B88A4A" strokeWidth="1.5" />
      {/* Big Lens */}
      <circle cx="45" cy="34" r="18" fill="#142523" stroke="#EAD3AA" strokeWidth="3" />
      <circle cx="45" cy="34" r="12" fill="#304943" />
      <circle cx="49" cy="30" r="4" fill="#F5E9D2" opacity="0.8" />
      {/* Red Dot Leica/Pro mark */}
      <circle cx="70" cy="22" r="3" fill="#D97A53" />
    </g>

    <g transform="translate(150, 65)">
      <rect x="0" y="0" width="70" height="26" rx="13" fill="#B88A4A" stroke="#F5E9D2" strokeWidth="1.5" />
      <text x="35" y="17" fill="#142523" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹1200/d</text>
    </g>
  </svg>
);

// 8. A PERSON PURCHASING ELECTRONIC ACCESSORIES
export const ElectronicsPurchaseIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="100" fill="#EAD3AA" fillOpacity="0.25" />
    <ellipse cx="120" cy="210" rx="75" ry="10" fill="#142523" fillOpacity="0.3" />

    <path d="M75 200 C75 160 85 140 120 140 C155 140 165 160 165 200 Z" fill="#D97A53" />
    <circle cx="120" cy="100" r="30" fill="#F5E9D2" />
    <circle cx="112" cy="102" r="3" fill="#202724" />
    <circle cx="128" cy="102" r="3" fill="#202724" />
    <path d="M114 114 Q120 120 126 114" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Shopping Bag with Accessories (Game Controller, Cables) */}
    <g transform="translate(78, 140)">
      {/* Bag Body */}
      <rect x="12" y="15" width="60" height="50" rx="4" fill="#EAD3AA" stroke="#80674D" strokeWidth="2" />
      {/* Bag Handle */}
      <path d="M28 15 C28 4 56 4 56 15" stroke="#80674D" strokeWidth="3" fill="none" />
      {/* Nintendo Switch Joy-Con sticking out */}
      <rect x="22" y="0" width="16" height="28" rx="6" fill="#304943" stroke="#F5E9D2" strokeWidth="1" />
      <circle cx="30" cy="8" r="3" fill="#F5E9D2" />
      {/* Rupee icon on Bag */}
      <text x="42" y="46" fill="#142523" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>
    </g>
  </svg>
);

// 9. EMPTY STATE ILLUSTRATION
export const EmptyStateIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="120" cy="120" r="95" fill="#EAD3AA" fillOpacity="0.15" />
    <ellipse cx="120" cy="200" rx="75" ry="10" fill="#142523" fillOpacity="0.25" />

    {/* Open Empty Treasure Box */}
    <path d="M60 140 L180 140 L165 190 L75 190 Z" fill="#80674D" stroke="#B88A4A" strokeWidth="2.5" />
    {/* Chest Lid Tilted Open */}
    <path d="M60 140 L110 85 L180 85 L180 140 Z" fill="#9C743E" stroke="#B88A4A" strokeWidth="2" opacity="0.9" />

    {/* Character looking inside with Magnifying Glass */}
    <circle cx="120" cy="85" r="22" fill="#F5E9D2" />
    <circle cx="114" cy="86" r="2.5" fill="#202724" />
    <circle cx="126" cy="86" r="2.5" fill="#202724" />
    <path d="M116 96 Q120 92 124 96" stroke="#80674D" strokeWidth="2" strokeLinecap="round" />

    {/* Magnifying Glass */}
    <g transform="translate(130, 80) rotate(20)">
      <circle cx="16" cy="16" r="14" stroke="#B88A4A" strokeWidth="3" fill="#EAD3AA" fillOpacity="0.3" />
      <rect x="26" y="26" width="6" height="20" rx="3" fill="#80674D" transform="rotate(-45 26 26)" />
    </g>

    {/* Floating Question Mark */}
    <text x="120" y="45" fill="#D97A53" fontSize="24" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
  </svg>
);
