import { DefectType, ListingCategory, ListingCondition } from '../types';

export const CONDITIONS: ListingCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Needs Repair',
];

export const DEFECT_OPTIONS: DefectType[] = [
  'No visible damage',
  'Minor scratches',
  'Major scratches',
  'Dents or physical marks',
  'Cracks or broken parts',
  'Functional issues',
  'Other',
];

export const PRODUCT_ONLY = 'Product only';

const ELECTRONICS = ['Original box', 'Charger / adapter', 'Cable', 'Remote', 'Battery', 'User manual', 'Warranty card', 'Other accessories'];
const COMPUTERS = ['Laptop bag', 'Charger', 'Mouse', 'Keyboard', 'Original box', 'User manual', 'Other accessories'];
const SPORTS = ['Carrying case', 'Protective gear', 'Accessories', 'Other'];
const BOOKS = ['Original cover', 'Notes or supplementary material', 'Other'];
const PHOTOGRAPHY = ['Original box', 'Battery', 'Charger', 'Lens cap', 'Strap', 'Memory card', 'Carrying bag', 'User manual', 'Other accessories'];
const GAMING = ['Original box', 'Controller', 'Cables', 'Charging dock', 'Game discs', 'Other accessories'];
const TOOLS = ['Carrying case', 'Batteries', 'Charger', 'Bits / attachments', 'User manual', 'Other accessories'];
const FASHION = ['Original tags', 'Dust bag', 'Original box', 'Other'];
const FURNITURE = ['Assembly hardware', 'Assembly manual', 'Other'];
const GENERIC = ['Original box', 'User manual', 'Other accessories'];

/** Category-aware accessory checklist. "Product only" is always offered first. */
export const getAccessoryOptions = (category: ListingCategory): string[] => {
  const map: Record<ListingCategory, string[]> = {
    Electronics: ELECTRONICS,
    'Computers and Accessories': COMPUTERS,
    Books: BOOKS,
    'Tools and Equipment': TOOLS,
    Photography: PHOTOGRAPHY,
    Gaming: GAMING,
    'Sports Equipment': SPORTS,
    'Cricket Equipment': SPORTS,
    'Fashion & Apparel': FASHION,
    Furniture: FURNITURE,
    Other: GENERIC,
  };
  return [PRODUCT_ONLY, ...(map[category] || GENERIC)];
};

/** Consistent badge colours for every condition, used on cards and the detail page. */
export const CONDITION_BADGE_STYLES: Record<ListingCondition, string> = {
  'Brand New': 'bg-emerald-950/85 text-emerald-200 border-emerald-500/50',
  'Like New': 'bg-teal-950/85 text-teal-200 border-teal-500/50',
  Excellent: 'bg-sky-950/85 text-sky-200 border-sky-500/50',
  Good: 'bg-narmis-forestDark/90 text-narmis-parchment border-narmis-gold/50',
  Fair: 'bg-amber-950/85 text-amber-200 border-amber-500/50',
  'Needs Repair': 'bg-red-950/85 text-red-200 border-red-500/50',
};

export const CONDITION_DESCRIPTIONS: Record<ListingCondition, string> = {
  'Brand New': 'Unused, in original packaging with factory seals intact.',
  'Like New': 'Used minimally with no visible signs of wear. Fully functional.',
  Excellent: 'Very minor cosmetic signs of handling; all components work perfectly.',
  Good: 'Normal cosmetic signs of regular use; fully operational.',
  Fair: 'Noticeable cosmetic wear or blemishes, but functional for its intended purpose.',
  'Needs Repair': 'Has a known defect or broken component and may require repair.',
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not supported. Please upload JPG, PNG or WEBP images.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is larger than 8 MB.`;
  }
  return null;
};
