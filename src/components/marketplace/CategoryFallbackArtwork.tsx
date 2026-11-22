import React from 'react';
import { ListingCategory } from '../../types';

export type VisualCategoryKey =
  | 'electronics'
  | 'computers'
  | 'phones'
  | 'gaming'
  | 'books'
  | 'sports'
  | 'music'
  | 'photography'
  | 'accessories'
  | 'furniture'
  | 'clothing'
  | 'tools'
  | 'other';

/**
 * Resolves the most accurate category illustration key using both the
 * structured ListingCategory and optional item title cues.
 */
export const resolveVisualCategory = (
  category?: ListingCategory | string,
  title?: string
): VisualCategoryKey => {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // Specific title/subcategory detection for rich accuracy
  if (
    /\b(iphone|samsung galaxy|oneplus|pixel|smartphone|mobile phone|redmi|realme|android phone)\b/.test(
      t
    )
  ) {
    return 'phones';
  }
  if (
    /\b(guitar|violin|piano|ukulele|synthesizer|midi|microphone|vocal|singing|drum|flute|harmonica)\b/.test(
      t
    )
  ) {
    return 'music';
  }
  if (
    /\b(watch|necklace|bracelet|earring|sunglasses|handbag|backpack|wallet|belt|strap|keycap|earbud|airpod)\b/.test(
      t
    ) &&
    c !== 'electronics'
  ) {
    return 'accessories';
  }

  switch (c) {
    case 'computers and accessories':
      return 'computers';
    case 'gaming':
      return 'gaming';
    case 'books':
      return 'books';
    case 'sports equipment':
    case 'cricket equipment':
      return 'sports';
    case 'photography':
      return 'photography';
    case 'fashion & apparel':
      return 'clothing';
    case 'furniture':
      return 'furniture';
    case 'tools and equipment':
      return 'tools';
    case 'electronics':
      return 'electronics';
    default:
      return 'other';
  }
};

const CATEGORY_LABELS: Record<VisualCategoryKey, { title: string; subtitle: string }> = {
  electronics: { title: 'Electronics & Circuits', subtitle: 'Category Illustration' },
  computers: { title: 'Laptops & Computing', subtitle: 'Category Illustration' },
  phones: { title: 'Phones & Mobile', subtitle: 'Category Illustration' },
  gaming: { title: 'Gaming & Consoles', subtitle: 'Category Illustration' },
  books: { title: 'Books & Study Material', subtitle: 'Category Illustration' },
  sports: { title: 'Sports & Athletics', subtitle: 'Category Illustration' },
  music: { title: 'Musical & Audio Gear', subtitle: 'Category Illustration' },
  photography: { title: 'Cameras & Optics', subtitle: 'Category Illustration' },
  accessories: { title: 'Personal Accessories', subtitle: 'Category Illustration' },
  furniture: { title: 'Furniture & Living', subtitle: 'Category Illustration' },
  clothing: { title: 'Clothing & Apparel', subtitle: 'Category Illustration' },
  tools: { title: 'Tools & Precision Gear', subtitle: 'Category Illustration' },
  other: { title: 'Community Item', subtitle: 'Category Illustration' },
};

const CategoryIconSvg: React.FC<{ kind: VisualCategoryKey }> = ({ kind }) => {
  const stroke = '#EAD3AA';
  const gold = '#B88A4A';
  const cream = '#F5E9D2';
  const surface = '#243C36';

  switch (kind) {
    case 'electronics':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="26" y="18" width="68" height="52" rx="8" fill={surface} stroke={gold} strokeWidth="2.2" />
          <rect x="35" y="27" width="50" height="24" rx="4" fill="#142523" stroke={stroke} strokeWidth="1.5" />
          <path d="M40 39 L47 39 L51 31 L56 46 L61 34 L65 39 L79 39" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="42" cy="60" r="3" fill={gold} />
          <circle cx="53" cy="60" r="3" fill={cream} />
          <rect x="65" y="57" width="16" height="6" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M18 32 H26 M18 44 H26 M18 56 H26 M94 32 H102 M94 44 H102 M94 56 H102" stroke={gold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'computers':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="24" y="14" width="72" height="46" rx="5" fill={surface} stroke={gold} strokeWidth="2.2" />
          <rect x="30" y="20" width="60" height="34" rx="2" fill="#142523" stroke={stroke} strokeWidth="1.4" />
          <path d="M40 32 H62 M40 38 H74 M40 44 H55" stroke={gold} strokeWidth="2" strokeLinecap="round" />
          <path d="M14 64 H106 L98 73 H22 L14 64 Z" fill={surface} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <rect x="50" y="66" width="20" height="3" rx="1.5" fill={gold} />
        </svg>
      );

    case 'phones':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="42" y="10" width="36" height="70" rx="7" fill={surface} stroke={gold} strokeWidth="2.2" />
          <rect x="46" y="18" width="28" height="52" rx="3" fill="#142523" stroke={stroke} strokeWidth="1.3" />
          <line x1="55" y1="14" x2="65" y2="14" stroke={gold} strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="40" r="8" stroke={gold} strokeWidth="1.8" />
          <path d="M56 40 L59 43 L65 37" stroke={cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="75" r="2" fill={stroke} />
        </svg>
      );

    case 'gaming':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path
            d="M34 26 H86 C95 26 102 36 104 52 C106 64 98 70 90 66 L78 56 H42 L30 66 C22 70 14 64 16 52 C18 36 25 26 34 26 Z"
            fill={surface}
            stroke={gold}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M36 37 V49 M30 43 H42" stroke={cream} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="79" cy="39" r="2.6" fill={gold} />
          <circle cx="86" cy="44" r="2.6" fill={cream} />
          <circle cx="79" cy="49" r="2.6" fill={stroke} />
          <circle cx="72" cy="44" r="2.6" fill={gold} />
          <rect x="54" y="39" width="12" height="5" rx="2.5" fill="#142523" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );

    case 'books':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="24" y="54" width="72" height="16" rx="3" fill={surface} stroke={gold} strokeWidth="2" />
          <rect x="30" y="36" width="64" height="16" rx="3" fill="#142523" stroke={stroke} strokeWidth="2" />
          <rect x="26" y="18" width="60" height="16" rx="3" fill={surface} stroke={gold} strokeWidth="2" />
          <path d="M68 18 V32 L73 28 L78 32 V18" fill={gold} />
          <line x1="36" y1="44" x2="72" y2="44" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="34" y1="62" x2="80" y2="62" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'sports':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <circle cx="60" cy="45" r="26" fill={surface} stroke={gold} strokeWidth="2.2" />
          <path d="M36 37 C48 45 72 45 84 37" stroke={stroke} strokeWidth="1.8" />
          <path d="M36 53 C48 45 72 45 84 53" stroke={stroke} strokeWidth="1.8" />
          <path d="M60 19 V71" stroke={gold} strokeWidth="1.8" />
          <path d="M44 25 C50 38 50 52 44 65" stroke={cream} strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M76 25 C70 38 70 52 76 65" stroke={cream} strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'music':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="50" y="14" width="20" height="34" rx="10" fill={surface} stroke={gold} strokeWidth="2.2" />
          <line x1="54" y1="26" x2="66" y2="26" stroke={stroke} strokeWidth="1.5" />
          <line x1="54" y1="32" x2="66" y2="32" stroke={stroke} strokeWidth="1.5" />
          <path d="M42 38 C42 50 49 56 60 56 C71 56 78 50 78 38" stroke={cream} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="60" y1="56" x2="60" y2="72" stroke={gold} strokeWidth="2.2" />
          <line x1="46" y1="72" x2="74" y2="72" stroke={gold} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 30 V48 M32 24 V54 M88 24 V54 M94 30 V48" stroke={gold} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        </svg>
      );

    case 'photography':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path d="M24 28 H38 L44 20 H76 L82 28 H96 C99 28 102 31 102 34 V66 C102 69 99 72 96 72 H24 C21 72 18 69 18 66 V34 C18 31 21 28 24 28 Z" fill={surface} stroke={gold} strokeWidth="2.2" />
          <circle cx="60" cy="49" r="15" fill="#142523" stroke={cream} strokeWidth="2.2" />
          <circle cx="60" cy="49" r="8" stroke={gold} strokeWidth="1.8" />
          <circle cx="88" cy="36" r="2.5" fill={gold} />
        </svg>
      );

    case 'accessories':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <rect x="51" y="10" width="18" height="16" rx="3" fill={surface} stroke={stroke} strokeWidth="1.8" />
          <rect x="51" y="64" width="18" height="16" rx="3" fill={surface} stroke={stroke} strokeWidth="1.8" />
          <circle cx="60" cy="45" r="20" fill="#142523" stroke={gold} strokeWidth="2.4" />
          <circle cx="60" cy="45" r="15" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" />
          <path d="M60 35 V45 L67 50" stroke={cream} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'furniture':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path d="M32 24 C32 19 36 16 42 16 H78 C84 16 88 19 88 24 V48 H32 V24 Z" fill={surface} stroke={gold} strokeWidth="2.2" />
          <rect x="22" y="38" width="12" height="24" rx="4" fill="#142523" stroke={stroke} strokeWidth="1.8" />
          <rect x="86" y="38" width="12" height="24" rx="4" fill="#142523" stroke={stroke} strokeWidth="1.8" />
          <rect x="34" y="48" width="52" height="14" rx="3" fill={surface} stroke={gold} strokeWidth="2" />
          <line x1="34" y1="62" x2="31" y2="74" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="86" y1="62" x2="89" y2="74" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'clothing':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path d="M56 14 C56 11 58 9 61 9 C64 9 66 11 66 14 C66 17 63 18 60 20 L30 34 L36 46 L44 42 V74 H76 V42 L84 46 L90 34 L60 20" fill={surface} stroke={gold} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M51 23 C54 29 66 29 69 23" stroke={cream} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="60" y1="29" x2="60" y2="74" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'tools':
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path d="M40 68 L72 36 C70 29 73 21 80 18 C83 17 87 17 90 19 L81 28 L87 34 L96 25 C98 28 98 32 97 35 C94 42 86 45 79 43 L47 75 C44 78 39 78 36 75 C33 72 33 67 36 64 Z" fill={surface} stroke={gold} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M30 22 L42 34 L36 40 L24 28 Z" fill="#142523" stroke={stroke} strokeWidth="1.8" />
          <line x1="40" y1="36" x2="76" y2="72" stroke={cream} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md" fill="none">
          <path d="M60 14 L94 31 V63 L60 80 L26 63 V31 L60 14 Z" fill={surface} stroke={gold} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M26 31 L60 48 L94 31 M60 48 V80" stroke={stroke} strokeWidth="1.8" />
          <path d="M43 22.5 L77 39.5" stroke={cream} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

interface CategoryFallbackArtworkProps {
  category?: ListingCategory | string;
  title?: string;
  compact?: boolean;
  className?: string;
}

export const CategoryFallbackArtwork: React.FC<CategoryFallbackArtworkProps> = ({
  category,
  title,
  compact = false,
  className = '',
}) => {
  const key = resolveVisualCategory(category, title);
  const meta = CATEGORY_LABELS[key];

  return (
    <div
      className={`w-full h-full relative flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br from-[#142523] via-[#1C322D] to-[#111E1C] ${className}`}
      role="img"
      aria-label={`${meta.title} — ${meta.subtitle}`}
    >
      {/* Subtle architectural botanical border pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(184,138,74,0.35) 0, transparent 45%), radial-gradient(circle at 80% 80%, rgba(234,211,170,0.22) 0, transparent 45%)',
        }}
      />
      {!compact && (
        <div className="absolute inset-3 rounded-xl border border-narmis-gold/20 pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <div className={compact ? 'scale-75' : 'mb-1.5'}>
          <CategoryIconSvg kind={key} />
        </div>

        {!compact && (
          <>
            <span className="font-serif text-xs sm:text-sm font-semibold text-narmis-parchment tracking-wide">
              {meta.title}
            </span>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-narmis-forestDark/80 text-narmis-gold border border-narmis-gold/30">
              {meta.subtitle} · No Seller Photo
            </span>
          </>
        )}
      </div>
    </div>
  );
};
