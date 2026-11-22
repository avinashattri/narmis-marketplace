import { Listing } from '../types';

/**
 * Temporary Hackathon Demonstration Mode:
 * When true, listings are created, viewed, edited, and deleted in browser
 * localStorage instead of depending on the Supabase listings sync migration.
 *
 * Authentication (Supabase Auth) and the NARMIS Trade Pass subscription /
 * verification workflow remain connected to Supabase.
 *
 * To restore Supabase listing synchronization later without losing local
 * listings, set this flag to `false` and run a migration sync for entries in
 * `LOCAL_LISTINGS_STORAGE_KEY`.
 */
export const USE_LOCAL_LISTING_STORAGE = true;

export const LOCAL_LISTINGS_STORAGE_KEY = 'narmis_local_listings_v1';
export const LOCAL_DELETED_IDS_STORAGE_KEY = 'narmis_local_deleted_listing_ids_v1';
const LEGACY_LISTINGS_STORAGE_KEY = 'narmis_listings';

export const isLocalListingId = (id: unknown): id is string =>
  typeof id === 'string' && id.startsWith('local-');

export const createLocalListingId = (): string => {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `local-${randomPart}`;
};

const safeParseArray = <T,>(raw: string | null): T[] | null => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
};

/**
 * Reads user-created and user-edited listings from localStorage.
 * Never silently deletes or overwrites corrupt/existing storage data.
 */
export const readLocalListings = (): Listing[] => {
  if (typeof window === 'undefined') return [];

  const primary = safeParseArray<Listing>(localStorage.getItem(LOCAL_LISTINGS_STORAGE_KEY));
  const legacy = safeParseArray<Listing>(localStorage.getItem(LEGACY_LISTINGS_STORAGE_KEY));

  const primaryList = primary ?? [];
  if (!legacy || legacy.length === 0) {
    return primaryList;
  }

  // Merge any legacy local listings that are not already in primary storage
  const existingIds = new Set(primaryList.map((item) => item.id));
  const merged = [...primaryList];
  for (const item of legacy) {
    if (item && typeof item.id === 'string' && !existingIds.has(item.id)) {
      merged.push(item);
      existingIds.add(item.id);
    }
  }
  return merged;
};

export const readDeletedListingIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  const parsed = safeParseArray<string>(localStorage.getItem(LOCAL_DELETED_IDS_STORAGE_KEY));
  return parsed ?? [];
};

/**
 * Merges locally persisted listings with starter catalog listings:
 * - Locally created listings appear first (newest first) so they show up
 *   immediately on Home, Explore, Rent, Trade, Purchase, Search, and Dashboard.
 * - Locally edited starter listings replace their starter versions.
 * - Explicitly deleted listings remain removed across refreshes.
 */
export const loadMergedLocalListings = (starterListings: Listing[]): Listing[] => {
  const localListings = readLocalListings();
  const deletedSet = new Set(readDeletedListingIds());

  const localById = new Map<string, Listing>();
  for (const item of localListings) {
    if (item && typeof item.id === 'string' && !deletedSet.has(item.id)) {
      localById.set(item.id, item);
    }
  }

  const starterIds = new Set(starterListings.map((s) => s.id));

  // User-created local listings (not in starter catalog), newest first
  const userCreatedListings = Array.from(localById.values())
    .filter((item) => !starterIds.has(item.id))
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

  // Starter listings (using local edited copy when present, excluding deleted ones)
  const resolvedStarterListings = starterListings
    .filter((item) => !deletedSet.has(item.id))
    .map((item) => localById.get(item.id) || item);

  return [...userCreatedListings, ...resolvedStarterListings];
};

const writeLocalListings = (items: Listing[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_LISTINGS_STORAGE_KEY, JSON.stringify(items));
  } catch (err: any) {
    if (
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      /quota/i.test(String(err?.message || ''))
    ) {
      throw new Error(
        'Unable to save listing images right now. Please try uploading smaller or fewer images.'
      );
    }
    throw new Error('Unable to save listing right now. Please try again.');
  }
};

const writeDeletedListingIds = (ids: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DELETED_IDS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // non-fatal
  }
};

/**
 * Inserts or updates a listing in localStorage without disturbing other saved listings.
 */
export const saveLocalListing = (listing: Listing): Listing[] => {
  const existing = readLocalListings();
  const idx = existing.findIndex((item) => item.id === listing.id);
  const next =
    idx >= 0
      ? existing.map((item) => (item.id === listing.id ? listing : item))
      : [listing, ...existing];

  writeLocalListings(next);

  // If this ID was previously tombstoned, un-delete it
  const deleted = readDeletedListingIds();
  if (deleted.includes(listing.id)) {
    writeDeletedListingIds(deleted.filter((id) => id !== listing.id));
  }

  return next;
};

/**
 * Deletes a listing from localStorage and records a tombstone if it belonged to starter data.
 */
export const removeLocalListing = (id: string, isStarterListing = false): void => {
  const existing = readLocalListings();
  const next = existing.filter((item) => item.id !== id);
  writeLocalListings(next);

  if (isStarterListing || !isLocalListingId(id)) {
    const deleted = readDeletedListingIds();
    if (!deleted.includes(id)) {
      writeDeletedListingIds([...deleted, id]);
    }
  }
};

/**
 * Compresses large uploaded data-URL images for reliable localStorage persistence
 * while keeping external http(s) and relative URLs untouched.
 */
const compressDataUrlForLocalStorage = async (dataUrl: string): Promise<string> => {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  // Already lightweight (< 140 KB)
  if (dataUrl.length < 140_000) return dataUrl;
  if (typeof window === 'undefined' || typeof document === 'undefined') return dataUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const prepareImagesForLocalStorage = (images: string[]): Promise<string[]> =>
  Promise.all(images.map((img) => compressDataUrlForLocalStorage(img)));
