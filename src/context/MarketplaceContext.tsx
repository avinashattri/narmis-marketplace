import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Listing,
  RentalRequest,
  TradeOffer,
  PurchaseTransaction,
  Conversation,
  Message,
  CommunityRequest,
  Review,
  CartItem,
  TradeAccessStatus,
  SubscriptionPayment,
} from '../types';
import {
  INITIAL_LISTINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_TRADE_OFFERS,
  INITIAL_RENTAL_REQUESTS,
  INITIAL_PURCHASES,
  INITIAL_COMMUNITY_REQUESTS,
  INITIAL_REVIEWS,
  DEMO_PROFILES,
} from '../services/mockData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { DEFAULT_CAMPUS_LOCATION, DEFAULT_COLLEGE_NAME } from '../services/locationDefaults';
import {
  USE_LOCAL_LISTING_STORAGE,
  LOCAL_LISTINGS_STORAGE_KEY,
  LOCAL_DELETED_IDS_STORAGE_KEY,
  createLocalListingId,
  loadMergedLocalListings,
  saveLocalListing,
  removeLocalListing,
} from '../services/localListingsStorage';

const isUuid = (id: unknown): id is string =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const DEFAULT_TRADE_ACCESS: TradeAccessStatus = {
  free_trials_total: 3,
  free_trials_used: 0,
  free_trials_remaining: 3,
  subscription_active: false,
  subscription_expires_at: null,
  can_trade: true,
  annual_price_inr: 299,
};

interface MarketplaceContextType {
  listings: Listing[];
  isLoadingListings: boolean;
  isLocalListingMode: boolean;
  refreshListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<Listing | null>;
  savedIds: string[];
  rentalRequests: RentalRequest[];
  tradeOffers: TradeOffer[];
  purchases: PurchaseTransaction[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  communityRequests: CommunityRequest[];

  addCommunityRequest: (
    request: Omit<CommunityRequest, 'id' | 'created_at' | 'user' | 'user_id'>
  ) => Promise<CommunityRequest>;
  confirmDealInChat: (
    conversationId: string,
    dealType: 'rental' | 'trade',
    notes?: string
  ) => Promise<void>;

  // Reviews
  reviews: Review[];
  getListingReviews: (listingId: string) => Review[];
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<Review>;
  hasUserCompletedTransaction: (listingId: string, userId: string) => boolean;

  // Listing Actions
  addListing: (
    listing: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'view_count' | 'status'>
  ) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  toggleSaveListing: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  getListing: (id: string) => Listing | undefined;

  // Rental actions
  createRentalRequest: (
    request: Omit<RentalRequest, 'id' | 'renter_id' | 'status' | 'created_at'>
  ) => Promise<RentalRequest>;
  updateRentalStatus: (id: string, status: RentalRequest['status']) => Promise<void>;

  // Trade actions & Trade Subscription system (UPI QR + Admin Verification)
  tradeAccess: TradeAccessStatus;
  isLoadingTradeAccess: boolean;
  isAdmin: boolean;
  subscriptionPayments: SubscriptionPayment[];
  adminSubscriptionPayments: SubscriptionPayment[];
  refreshTradeAccess: () => Promise<TradeAccessStatus>;
  refreshAdminSubscriptionPayments: (statusFilter?: string) => Promise<void>;
  reviewSubscriptionPayment: (params: {
    paymentId: string;
    decision: 'approve' | 'reject';
    rejectionReason?: string;
  }) => Promise<void>;
  createTradeOffer: (
    offer: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>
  ) => Promise<TradeOffer>;
  updateTradeStatus: (id: string, status: TradeOffer['status']) => Promise<void>;
  recordSubscriptionPaymentSubmission: (params: {
    paymentReference: string;
  }) => Promise<SubscriptionPayment>;

  // Purchase & Persistent Shopping Cart actions
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (listingId: string, quantity?: number) => Promise<void>;
  removeFromCart: (listingId: string) => Promise<void>;
  updateCartQuantity: (listingId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkoutCart: (params: {
    address: string;
    paymentReference?: string;
  }) => Promise<PurchaseTransaction[]>;
  submitPurchasePayment: (params: {
    listingId: string;
    address: string;
    paymentReference?: string;
  }) => Promise<PurchaseTransaction>;

  // Messaging actions
  sendMessage: (
    conversationId: string,
    content: string,
    type?: Message['message_type'],
    metadata?: Record<string, any>
  ) => Promise<void>;
  startOrGetConversation: (
    listingId: string,
    targetUserId: string,
    subject?: string
  ) => Promise<string>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const DATA_VERSION = 'v10';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFreshVersion = localStorage.getItem('narmis_version') === DATA_VERSION;
      if (!isFreshVersion) {
        localStorage.setItem('narmis_version', DATA_VERSION);
        // Never wipe local listing data — preserve locally created listings across versions
      }
    }
  }, []);

  const [listings, setListings] = useState<Listing[]>(() =>
    USE_LOCAL_LISTING_STORAGE ? loadMergedLocalListings(INITIAL_LISTINGS) : INITIAL_LISTINGS
  );
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(false);

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_saved_ids');
      return cached ? JSON.parse(cached) : ['list-vipan-1', 'list-shraddha-1'];
    } catch {
      return [];
    }
  });

  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(INITIAL_RENTAL_REQUESTS);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>(INITIAL_TRADE_OFFERS);
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(INITIAL_PURCHASES);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>(
    INITIAL_COMMUNITY_REQUESTS
  );
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');

  // Trade Subscription & Trial State (Server-Authoritative)
  const [tradeAccess, setTradeAccess] = useState<TradeAccessStatus>(DEFAULT_TRADE_ACCESS);
  const [isLoadingTradeAccess, setIsLoadingTradeAccess] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>([]);
  const [adminSubscriptionPayments, setAdminSubscriptionPayments] = useState<SubscriptionPayment[]>(
    []
  );

  // Persistent Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    localStorage.setItem('narmis_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);

  const mapDbListing = useCallback((l: any): Listing => {
    const imgsOf = (type: 'product' | 'condition') =>
      ((l.listing_images || []) as any[])
        .filter((i) => (i.image_type || 'product') === type)
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((i) => i.image_url as string);

    return {
      id: l.id,
      user_id: l.user_id,
      user: l.profiles
        ? {
            id: l.profiles.id || l.user_id,
            full_name: l.profiles.full_name || 'Marketplace Member',
            avatar_url:
              l.profiles.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                l.profiles.full_name || 'Member'
              )}&background=304943&color=EAD3AA`,
            bio: l.profiles.bio,
            location: l.profiles.location || l.location,
            college_name: l.profiles.college_name,
            college_verification_status:
              l.profiles.college_verification_status || 'Not Submitted',
            rating: Number(l.profiles.rating) || 5.0,
            review_count: Number(l.profiles.review_count) || 0,
          }
        : undefined,
      title: l.title,
      description: l.description,
      category: l.category,
      condition: l.condition,
      listing_type: l.listing_type,
      brand: l.brand ?? undefined,
      model_name: l.model_name ?? undefined,
      product_age: l.product_age ?? undefined,
      purchase_date: l.purchase_date ?? undefined,
      original_mrp: l.original_mrp !== null && l.original_mrp !== undefined ? Number(l.original_mrp) : undefined,
      accessories_included: l.accessories_included ?? undefined,
      warranty_status: l.warranty_status ?? undefined,
      invoice_available: l.invoice_available ?? undefined,
      defects: l.defects ?? undefined,
      defect_other: l.defect_other ?? undefined,
      defect_description: l.defect_description ?? undefined,
      included_items: l.included_items ?? undefined,
      included_custom: l.included_custom ?? undefined,
      missing_accessories: l.missing_accessories ?? undefined,
      packaging_available: l.packaging_available ?? undefined,
      warranty_valid: l.warranty_valid ?? undefined,
      documentation_notes: l.documentation_notes ?? undefined,
      condition_images: imgsOf('condition'),
      terms_accepted: l.terms_accepted,
      terms_accepted_at: l.terms_accepted_at,
      terms_version: l.terms_version,
      rental_price: l.rental_price !== null && l.rental_price !== undefined ? Number(l.rental_price) : undefined,
      rental_duration: l.rental_duration ?? undefined,
      availability_status: l.availability_status || 'available',
      estimated_value:
        l.estimated_value !== null && l.estimated_value !== undefined
          ? Number(l.estimated_value)
          : undefined,
      trade_desired: l.trade_desired ?? undefined,
      trade_cash_adjustment:
        l.trade_cash_adjustment !== null && l.trade_cash_adjustment !== undefined
          ? Number(l.trade_cash_adjustment)
          : undefined,
      purchase_price:
        l.purchase_price !== null && l.purchase_price !== undefined
          ? Number(l.purchase_price)
          : undefined,
      quantity_available:
        typeof l.quantity_available === 'number' ? l.quantity_available : 1,
      images: imgsOf('product'),
      location: l.location || DEFAULT_CAMPUS_LOCATION,
      status: l.status || 'active',
      featured: Boolean(l.featured),
      view_count: Number(l.view_count) || 0,
      created_at: l.created_at,
      updated_at: l.updated_at,
    };
  }, []);

  // Ensure the signed-in user has a row in public.profiles so FK references never fail
  const ensureCurrentUserProfileRow = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user || !session?.access_token) return;
    try {
      await supabase.from('profiles').upsert(
        [
          {
            id: user.id,
            full_name: user.full_name || 'Marketplace Member',
            avatar_url: user.avatar_url,
            bio: user.bio || 'Member of NARMIS circular community.',
            location: user.location || DEFAULT_CAMPUS_LOCATION,
            college_name: user.college_name || DEFAULT_COLLEGE_NAME,
          },
        ],
        { onConflict: 'id', ignoreDuplicates: true }
      );
    } catch {
      // ignore if trigger already created profile
    }
  }, [user, session?.access_token]);

  // Fetch listings (from browser localStorage in temporary local mode, or from Supabase when restored)
  const refreshListings = useCallback(async () => {
    if (USE_LOCAL_LISTING_STORAGE) {
      setListings(loadMergedLocalListings(INITIAL_LISTINGS));
      setIsLoadingListings(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    setIsLoadingListings(true);

    try {
      const { data: dbListings, error: listErr } = await client
        .from('listings')
        .select('*, profiles(*), listing_images(*)')
        .order('created_at', { ascending: false });

      if (!listErr && Array.isArray(dbListings)) {
        const mapped = dbListings.map(mapDbListing);
        const dbIds = new Set(mapped.map((m) => m.id));
        // Keep predefined non-UUID showcase catalog items while making Supabase 100% authoritative for all UUID listings
        const staticShowcase = INITIAL_LISTINGS.filter(
          (item) => !isUuid(item.id) && !dbIds.has(item.id)
        );
        setListings([...mapped, ...staticShowcase]);
      } else if (listErr) {
        console.warn('[NARMIS] Supabase listings fetch error:', listErr.code, listErr.message);
      }
    } catch (err) {
      console.warn('[NARMIS] Supabase listings sync error:', err);
    } finally {
      setIsLoadingListings(false);
    }
  }, [mapDbListing]);

  const fetchListingById = useCallback(
    async (id: string): Promise<Listing | null> => {
      const localMatch = listings.find((l) => l.id === id);
      if (USE_LOCAL_LISTING_STORAGE) {
        if (localMatch) return localMatch;
        const merged = loadMergedLocalListings(INITIAL_LISTINGS);
        const found = merged.find((l) => l.id === id) || null;
        if (found) {
          setListings(merged);
        }
        return found;
      }

      if (!isSupabaseConfigured || !supabase || !isUuid(id)) {
        return localMatch || null;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles(*), listing_images(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const mapped = mapDbListing(data);
          setListings((prev) => {
            const exists = prev.some((item) => item.id === mapped.id);
            return exists
              ? prev.map((item) => (item.id === mapped.id ? mapped : item))
              : [mapped, ...prev];
          });
          return mapped;
        }
      } catch (err) {
        console.warn('[NARMIS] fetchListingById error:', err);
      }
      return localMatch || null;
    },
    [listings, mapDbListing]
  );

  // Refresh server-side Trade Trial & Subscription status from Supabase
  const refreshTradeAccess = useCallback(async (): Promise<TradeAccessStatus> => {
    if (!isSupabaseConfigured || !supabase || !user?.id || !session?.access_token) {
      setTradeAccess(DEFAULT_TRADE_ACCESS);
      setSubscriptionPayments([]);
      setAdminSubscriptionPayments([]);
      setIsAdmin(false);
      setIsLoadingTradeAccess(false);
      return DEFAULT_TRADE_ACCESS;
    }

    const client = supabase;
    setIsLoadingTradeAccess(true);
    let resolvedAccess: TradeAccessStatus = DEFAULT_TRADE_ACCESS;
    try {
      // Check admin privilege server-side
      try {
        const { data: adminFlag, error: adminErr } = await client.rpc('is_current_user_admin');
        setIsAdmin(!adminErr && Boolean(adminFlag));
      } catch {
        setIsAdmin(false);
      }

      // 1. Try server-side SECURITY DEFINER function get_trade_access()
      const { data: rpcData, error: rpcErr } = await client.rpc('get_trade_access');
      if (!rpcErr && rpcData) {
        resolvedAccess = {
          free_trials_total: Number(rpcData.free_trials_total ?? 3),
          free_trials_used: Number(rpcData.free_trials_used ?? 0),
          free_trials_remaining: Number(rpcData.free_trials_remaining ?? 3),
          subscription_active: Boolean(rpcData.subscription_active),
          subscription_expires_at: rpcData.subscription_expires_at || null,
          can_trade: Boolean(rpcData.can_trade),
          annual_price_inr: Number(rpcData.annual_price_inr ?? 299),
        };
        setTradeAccess(resolvedAccess);
      } else {
        // 2. Fallback: read trade_subscriptions & count trade_offers directly from Supabase
        let subRow: any = null;
        try {
          const { data: sData } = await client
            .from('trade_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          subRow = sData;
        } catch {
          // table may not exist yet
        }

        const { count: offerCount } = await client
          .from('trade_offers')
          .select('id', { count: 'exact', head: true })
          .eq('requester_id', user.id);

        const used = Math.min(
          3,
          Math.max(Number(subRow?.free_trials_used ?? 0), Number(offerCount ?? 0))
        );
        const expiresAt: string | null = subRow?.subscription_expires_at || null;
        const isActive = Boolean(expiresAt && new Date(expiresAt).getTime() > Date.now());
        const remaining = Math.max(0, 3 - used);
        resolvedAccess = {
          free_trials_total: 3,
          free_trials_used: used,
          free_trials_remaining: remaining,
          subscription_active: isActive,
          subscription_expires_at: expiresAt,
          can_trade: isActive || remaining > 0,
          annual_price_inr: 299,
        };
        setTradeAccess(resolvedAccess);
      }

      // Fetch user's subscription payment history from Supabase
      try {
        const { data: payRows, error: payErr } = await client
          .from('subscription_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!payErr && Array.isArray(payRows)) {
          const normalized: SubscriptionPayment[] = payRows.map((row: any) => ({
            ...row,
            upi_reference: row.upi_reference || row.provider_payment_id || null,
            verification_status:
              row.verification_status ||
              (row.status === 'paid' || row.status === 'approved'
                ? 'Approved'
                : row.status === 'rejected'
                ? 'Rejected'
                : 'Pending Verification'),
          }));
          setSubscriptionPayments(normalized);
        }
      } catch {
        // ignore if subscription_payments table not migrated yet
      }
    } catch (err) {
      console.warn('[NARMIS] refreshTradeAccess notice:', err);
    } finally {
      setIsLoadingTradeAccess(false);
    }

    return resolvedAccess;
  }, [user?.id, session?.access_token]);

  const refreshAdminSubscriptionPayments = useCallback(
    async (statusFilter?: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase || !user?.id || !session?.access_token) {
        setAdminSubscriptionPayments([]);
        return;
      }
      const { data, error } = await supabase.rpc('admin_list_subscription_payments', {
        p_status: statusFilter || null,
      });
      if (error) {
        if (error.code === '42501' || /ADMIN_REQUIRED/i.test(error.message)) {
          setIsAdmin(false);
          setAdminSubscriptionPayments([]);
          return;
        }
        throw new Error(error.message);
      }
      if (Array.isArray(data)) {
        setAdminSubscriptionPayments(data as SubscriptionPayment[]);
      }
    },
    [user?.id, session?.access_token]
  );

  const reviewSubscriptionPayment = async ({
    paymentId,
    decision,
    rejectionReason,
  }: {
    paymentId: string;
    decision: 'approve' | 'reject';
    rejectionReason?: string;
  }): Promise<void> => {
    if (!isSupabaseConfigured || !supabase || !user?.id || !session?.access_token) {
      throw new Error('Please sign in with an administrator account.');
    }

    const { error } = await supabase.rpc('admin_review_subscription_payment', {
      p_payment_id: paymentId,
      p_decision: decision,
      p_rejection_reason: rejectionReason?.trim() || null,
    });

    if (error) {
      throw new Error(error.message || 'Unable to review subscription payment.');
    }

    await Promise.all([refreshAdminSubscriptionPayments(), refreshTradeAccess()]);
  };

  // Fetch persistent shopping cart from Supabase for logged-in user
  const fetchCartFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user?.id || !session?.access_token) {
      setCartItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, listings(*, profiles(*), listing_images(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: CartItem[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          listing_id: row.listing_id,
          listing: row.listings ? mapDbListing(row.listings) : undefined,
          quantity: Number(row.quantity) || 1,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setCartItems(mapped);
      }
    } catch (err) {
      console.warn('[NARMIS] fetchCartFromSupabase notice:', err);
    }
  }, [user?.id, session?.access_token, mapDbListing]);

  // Sync user-scoped data (saved items, rentals, trades, purchases, conversations, cart, trade access)
  const fetchUserScopedData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user?.id || !session?.access_token) return;
    const client = supabase;

    await ensureCurrentUserProfileRow();

    try {
      const { data: savedRows, error: savedErr } = await client
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', user.id);
      if (!savedErr && Array.isArray(savedRows)) {
        setSavedIds(savedRows.map((s: any) => s.listing_id));
      }
    } catch {
      // ignore
    }

    try {
      const { data: dbTrades, error: tradeErr } = await client
        .from('trade_offers')
        .select('*, listings(*)')
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (!tradeErr && Array.isArray(dbTrades) && dbTrades.length > 0) {
        const mappedTrades: TradeOffer[] = dbTrades.map((t: any) => ({
          id: t.id,
          listing_id: t.listing_id,
          listing: t.listings ? mapDbListing(t.listings) : undefined,
          requester_id: t.requester_id,
          owner_id: t.owner_id,
          offered_item_title: t.offered_item_title,
          offered_item_description: t.offered_item_description,
          offered_item_image: t.offered_item_image || undefined,
          offered_item_value: Number(t.offered_item_value) || 0,
          cash_adjustment: Number(t.cash_adjustment) || 0,
          status: t.status,
          negotiation_notes: t.negotiation_notes || undefined,
          terms_accepted: t.terms_accepted,
          terms_accepted_at: t.terms_accepted_at,
          created_at: t.created_at,
        }));
        setTradeOffers(mappedTrades);
      }
    } catch {
      // ignore
    }

    try {
      const { data: dbPurchases, error: purErr } = await client
        .from('purchases')
        .select('*, listings(*)')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (!purErr && Array.isArray(dbPurchases) && dbPurchases.length > 0) {
        const mappedPurchases: PurchaseTransaction[] = dbPurchases.map((p: any) => ({
          id: p.id,
          listing_id: p.listing_id,
          listing: p.listings ? mapDbListing(p.listings) : undefined,
          buyer_id: p.buyer_id,
          seller_id: p.seller_id,
          amount: Number(p.amount) || 0,
          quantity: Number(p.quantity) || 1,
          unit_price: p.unit_price ? Number(p.unit_price) : undefined,
          checkout_group_id: p.checkout_group_id || undefined,
          status: p.status,
          payment_method: p.payment_method,
          payment_reference: p.payment_reference || undefined,
          payment_confirmed_by_buyer: p.payment_confirmed_by_buyer,
          payment_confirmed_at: p.payment_confirmed_at,
          payment_verification_status: p.payment_verification_status,
          receipt_number: p.receipt_number,
          shipping_address: p.shipping_address,
          created_at: p.created_at,
        }));
        setPurchases(mappedPurchases);
      }
    } catch {
      // ignore
    }

    await Promise.all([refreshTradeAccess(), fetchCartFromSupabase()]);
  }, [
    user?.id,
    session?.access_token,
    ensureCurrentUserProfileRow,
    mapDbListing,
    refreshTradeAccess,
    fetchCartFromSupabase,
  ]);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    fetchUserScopedData();
  }, [fetchUserScopedData]);

  // Refetch listings & user state when window regains focus or tab becomes visible
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshListings();
        if (user?.id) {
          fetchCartFromSupabase();
          refreshTradeAccess();
        }
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [refreshListings, fetchCartFromSupabase, refreshTradeAccess, user?.id]);

  // Sync locally stored listings across tabs in the same browser when in local mode
  useEffect(() => {
    if (!USE_LOCAL_LISTING_STORAGE || typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === LOCAL_LISTINGS_STORAGE_KEY ||
        e.key === LOCAL_DELETED_IDS_STORAGE_KEY ||
        e.key === null
      ) {
        setListings(loadMergedLocalListings(INITIAL_LISTINGS));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Realtime subscription for cross-device listing changes (skipped while temporary local listing mode is active)
  useEffect(() => {
    if (USE_LOCAL_LISTING_STORAGE) return;
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const listingsChannel = client
      .channel('narmis-public-listings-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.eventType === 'DELETE' && payload.old?.id) {
            const deletedId = payload.old.id as string;
            setListings((prev) => prev.filter((item) => item.id !== deletedId));
            return;
          }
          refreshListings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listing_images' },
        () => {
          refreshListings();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(listingsChannel);
    };
  }, [refreshListings]);

  // Realtime subscription for user-specific messages & cart items
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;
    const client = supabase;

    const userChannel = client
      .channel(`narmis-user-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as any;
          if (!m || !m.conversation_id) return;
          setMessages((prev) => {
            const list = prev[m.conversation_id] || [];
            if (list.some((x) => x.id === m.id)) return prev;
            return {
              ...prev,
              [m.conversation_id]: [
                ...list,
                {
                  id: m.id,
                  conversation_id: m.conversation_id,
                  sender_id: m.sender_id,
                  content: m.content,
                  message_type: m.message_type,
                  metadata: m.metadata || {},
                  is_read: m.is_read,
                  created_at: m.created_at,
                },
              ],
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCartFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshTradeAccess();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_payments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshTradeAccess();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(userChannel);
    };
  }, [user?.id, fetchCartFromSupabase, refreshTradeAccess]);

  const getListing = useCallback(
    (id: string): Listing | undefined => {
      return listings.find((l) => l.id === id);
    },
    [listings]
  );

  const getListingReviews = (listingId: string): Review[] => {
    return reviews.filter((r) => r.listing_id === listingId);
  };

  const hasUserCompletedTransaction = (listingId: string, userId: string): boolean => {
    const bought = purchases.some(
      (p) =>
        p.listing_id === listingId &&
        p.buyer_id === userId &&
        (p.status === 'completed' || p.status === 'payment_submitted')
    );
    const rented = rentalRequests.some(
      (r) =>
        r.listing_id === listingId &&
        r.renter_id === userId &&
        (r.status === 'approved' || r.status === 'completed')
    );
    const traded = tradeOffers.some(
      (t) =>
        t.listing_id === listingId &&
        t.requester_id === userId &&
        (t.status === 'accepted' || t.status === 'completed')
    );
    return bought || rented || traded;
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
    if (user && reviewData.target_user_id === user.id) {
      throw new Error('You cannot review your own listing.');
    }

    const existing = reviews.find(
      (r) => r.reviewer_id === reviewData.reviewer_id && r.listing_id === reviewData.listing_id
    );
    if (existing) {
      throw new Error('You have already submitted a review for this transaction.');
    }

    const newRev: Review = {
      ...reviewData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('reviews').insert([
        {
          id: newRev.id,
          reviewer_id: newRev.reviewer_id,
          target_user_id: newRev.target_user_id,
          listing_id: isUuid(newRev.listing_id) ? newRev.listing_id : null,
          rating: newRev.rating,
          comment: newRev.comment,
        },
      ]);
      if (error) {
        console.warn('[NARMIS] Review insert notice:', error.message);
      }
    }

    setReviews((prev) => [newRev, ...prev]);
    return newRev;
  };

  const toListingRow = (data: Partial<Listing>) => {
    const row: Record<string, any> = {
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      listing_type: data.listing_type,
      brand: data.brand,
      model_name: data.model_name,
      product_age: data.product_age,
      purchase_date: data.purchase_date,
      original_mrp: data.original_mrp,
      accessories_included: data.accessories_included,
      warranty_status: data.warranty_status,
      invoice_available: data.invoice_available,
      defects: data.defects,
      defect_other: data.defect_other,
      defect_description: data.defect_description,
      included_items: data.included_items,
      included_custom: data.included_custom,
      missing_accessories: data.missing_accessories,
      packaging_available: data.packaging_available,
      warranty_valid: data.warranty_valid,
      documentation_notes: data.documentation_notes,
      terms_accepted: data.terms_accepted,
      terms_accepted_at: data.terms_accepted_at,
      terms_version: data.terms_version,
      rental_price: data.rental_price,
      rental_duration: data.rental_duration,
      availability_status: data.availability_status,
      estimated_value: data.estimated_value,
      trade_desired: data.trade_desired,
      trade_cash_adjustment: data.trade_cash_adjustment,
      purchase_price: data.purchase_price,
      location: data.location,
      status: data.status,
      featured: data.featured,
    };
    Object.keys(row).forEach((k) => {
      if (!(k in data)) delete row[k];
    });
    return row;
  };

  const replaceListingImages = async (
    listingId: string,
    product?: string[],
    condition?: string[]
  ) => {
    if (!isSupabaseConfigured || !supabase) return;
    const rows: any[] = [];
    if (product) {
      await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId)
        .eq('image_type', 'product');
      product.forEach((url, idx) =>
        rows.push({
          listing_id: listingId,
          image_url: url,
          is_primary: idx === 0,
          image_type: 'product',
        })
      );
    }
    if (condition) {
      await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId)
        .eq('image_type', 'condition');
      condition.forEach((url) =>
        rows.push({
          listing_id: listingId,
          image_url: url,
          is_primary: false,
          image_type: 'condition',
        })
      );
    }
    if (rows.length) {
      const { error } = await supabase.from('listing_images').insert(rows);
      if (error) {
        console.warn('[NARMIS] listing_images insert error:', error.message);
      }
    }
  };

  const addListing = async (
    data: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'view_count' | 'status'>
  ): Promise<Listing> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in with a valid account to create a listing.');
    }

    const nowIso = new Date().toISOString();

    if (USE_LOCAL_LISTING_STORAGE) {
      const newListing: Listing = {
        ...data,
        id: createLocalListingId(),
        user_id: user.id,
        user,
        status: 'active',
        view_count: 0,
        created_at: nowIso,
        updated_at: nowIso,
      };
      saveLocalListing(newListing);
      setListings(loadMergedLocalListings(INITIAL_LISTINGS));
      return newListing;
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    await ensureCurrentUserProfileRow();

    const newId = crypto.randomUUID();

    const { error } = await supabase
      .from('listings')
      .insert([{ id: newId, user_id: user.id, ...toListingRow({ ...data, status: 'active' }) }]);

    if (error) {
      if (error.code === '42501') {
        throw new Error(
          'Database permission error (42501): Please run the SQL migration 20261123_01_api_grants_and_listing_sync.sql in your Supabase SQL Editor to grant API role permissions on public.listings.'
        );
      }
      throw new Error(`Failed to save listing to Supabase: ${error.message}`);
    }

    await replaceListingImages(newId, data.images || [], data.condition_images || []);

    const newListing: Listing = {
      ...data,
      id: newId,
      user_id: user.id,
      user,
      status: 'active',
      view_count: 0,
      created_at: nowIso,
    };

    setListings((prev) => [newListing, ...prev]);
    // Refresh from Supabase so server-hydrated fields & images are immediately verified
    await refreshListings();
    return newListing;
  };

  const updateListing = async (id: string, updates: Partial<Listing>): Promise<void> => {
    const existing = listings.find((l) => l.id === id);
    if (!existing) throw new Error('Listing not found.');

    const isOwner = user && existing.user_id === user.id;
    const isStatusUpdateOnly =
      Object.keys(updates).length === 1 &&
      (updates.status === 'pending' || updates.status === 'completed');

    if (!isOwner && !isStatusUpdateOnly) {
      throw new Error('You can only edit your own listings.');
    }

    const { id: _i, user_id: _u, user: _usr, created_at: _c, ...safeUpdates } = updates as any;

    if (USE_LOCAL_LISTING_STORAGE) {
      const updatedListing: Listing = {
        ...existing,
        ...safeUpdates,
        updated_at: new Date().toISOString(),
      };
      saveLocalListing(updatedListing);
      setListings(loadMergedLocalListings(INITIAL_LISTINGS));
      return;
    }

    if (isSupabaseConfigured && supabase && isOwner && isUuid(id)) {
      const row = toListingRow(safeUpdates);
      if (Object.keys(row).length) {
        const { error } = await supabase
          .from('listings')
          .update(row)
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) {
          throw new Error(`Failed to update listing in Supabase: ${error.message}`);
        }
      }
      if (safeUpdates.images || safeUpdates.condition_images) {
        await replaceListingImages(id, safeUpdates.images, safeUpdates.condition_images);
      }
    }

    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...safeUpdates } : item))
    );
  };

  const deleteListing = async (id: string): Promise<void> => {
    const existing = listings.find((l) => l.id === id);
    if (!existing || !user || existing.user_id !== user.id) {
      throw new Error('You can only delete your own listings.');
    }

    if (USE_LOCAL_LISTING_STORAGE) {
      const isStarter = INITIAL_LISTINGS.some((item) => item.id === id);
      removeLocalListing(id, isStarter);
      setListings(loadMergedLocalListings(INITIAL_LISTINGS));
      return;
    }

    if (isSupabaseConfigured && supabase && isUuid(id)) {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) {
        throw new Error(`Failed to delete listing from Supabase: ${error.message}`);
      }
    }

    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleSaveListing = async (id: string): Promise<void> => {
    const currentlySaved = savedIds.includes(id);
    setSavedIds((prev) => (currentlySaved ? prev.filter((i) => i !== id) : [...prev, id]));

    if (isSupabaseConfigured && supabase && user?.id && isUuid(id)) {
      try {
        if (currentlySaved) {
          await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', user.id)
            .eq('listing_id', id);
        } else {
          await supabase
            .from('saved_listings')
            .insert([{ user_id: user.id, listing_id: id }]);
        }
      } catch {
        // ignore
      }
    }
  };

  const isSaved = (id: string) => savedIds.includes(id);

  // =========================================================================
  // PERSISTENT SHOPPING CART ACTIONS
  // =========================================================================
  const resolvedCartItems = cartItems.map((ci) => ({
    ...ci,
    listing: ci.listing || listings.find((l) => l.id === ci.listing_id),
  }));

  const cartCount = resolvedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = resolvedCartItems.reduce((sum, item) => {
    const l = item.listing;
    if (!l || l.status !== 'active' || l.listing_type !== 'purchase') return sum;
    return sum + (Number(l.purchase_price) || 0) * item.quantity;
  }, 0);

  const addToCart = async (listingId: string, quantity = 1): Promise<void> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to add items to your cart.');
    }
    const target = listings.find((l) => l.id === listingId);
    if (!target) {
      throw new Error('This listing could not be found.');
    }
    if (target.status !== 'active') {
      throw new Error('This listing is no longer available for purchase.');
    }
    if (target.listing_type !== 'purchase') {
      throw new Error('Only items listed for direct purchase can be added to the cart.');
    }
    if (target.user_id === user.id) {
      throw new Error('You cannot add your own listing to your purchase cart.');
    }
    const maxAvail = target.quantity_available ?? 1;
    const existingItem = cartItems.find((c) => c.listing_id === listingId);
    const nextQty = (existingItem?.quantity || 0) + quantity;
    if (nextQty > maxAvail) {
      throw new Error(
        maxAvail === 1
          ? 'This item is already in your cart (only 1 unit available).'
          : `Only ${maxAvail} units available for this listing.`
      );
    }

    if (isSupabaseConfigured && supabase && isUuid(listingId)) {
      await ensureCurrentUserProfileRow();
      const { error: rpcError } = await supabase.rpc('add_to_cart', {
        p_listing_id: listingId,
        p_quantity: quantity,
      });

      if (rpcError) {
        // Fallback to direct cart_items table upsert if RPC migration has not been run yet
        const { error: tblErr } = await supabase.from('cart_items').upsert(
          [
            {
              user_id: user.id,
              listing_id: listingId,
              quantity: nextQty,
            },
          ],
          { onConflict: 'user_id,listing_id' }
        );
        if (tblErr) {
          console.warn('[NARMIS] Cart Supabase sync notice:', tblErr.message);
        }
      }
    }

    const nowIso = new Date().toISOString();
    setCartItems((prev) => {
      const idx = prev.findIndex((c) => c.listing_id === listingId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: nextQty,
          listing: target,
          updated_at: nowIso,
        };
        return updated;
      }
      return [
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          listing_id: listingId,
          listing: target,
          quantity: nextQty,
          created_at: nowIso,
          updated_at: nowIso,
        },
        ...prev,
      ];
    });
  };

  const removeFromCart = async (listingId: string): Promise<void> => {
    setCartItems((prev) => prev.filter((c) => c.listing_id !== listingId));
    if (isSupabaseConfigured && supabase && user?.id && isUuid(listingId)) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
      } catch (err) {
        console.warn('[NARMIS] removeFromCart notice:', err);
      }
    }
  };

  const updateCartQuantity = async (listingId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      await removeFromCart(listingId);
      return;
    }

    const target = listings.find((l) => l.id === listingId);
    if (!target || target.status !== 'active') {
      throw new Error('This listing is no longer active.');
    }
    const maxAvail = target.quantity_available ?? 1;
    if (quantity > maxAvail) {
      throw new Error(`Only ${maxAvail} available for "${target.title}".`);
    }

    if (isSupabaseConfigured && supabase && user?.id && isUuid(listingId)) {
      const { error: rpcErr } = await supabase.rpc('set_cart_quantity', {
        p_listing_id: listingId,
        p_quantity: quantity,
      });
      if (rpcErr) {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
      }
    }

    setCartItems((prev) =>
      prev.map((c) => (c.listing_id === listingId ? { ...c, quantity } : c))
    );
  };

  const clearCart = async (): Promise<void> => {
    setCartItems([]);
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch {
        // ignore
      }
    }
  };

  // =========================================================================
  // MESSAGING & CONVERSATIONS
  // =========================================================================
  const startOrGetConversation = async (
    listingId: string,
    targetUserId: string,
    subject?: string
  ): Promise<string> => {
    const existing = conversations.find(
      (c) =>
        (c.participant1_id === user?.id && c.participant2_id === targetUserId) ||
        (c.participant2_id === user?.id && c.participant1_id === targetUserId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const partner =
      DEMO_PROFILES.find((p) => p.id === targetUserId) ||
      listings.find((l) => l.user_id === targetUserId)?.user || {
        id: targetUserId,
        full_name: 'Marketplace Member',
        avatar_url: 'https://ui-avatars.com/api/?name=Member&background=304943&color=EAD3AA',
      };

    const targetListing = getListing(listingId);
    const newConvId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const resolvedSubject =
      subject || (targetListing ? `Regarding ${targetListing.title}` : 'Inquiry');

    if (isSupabaseConfigured && supabase && user?.id && isUuid(targetUserId)) {
      try {
        await supabase.from('conversations').insert([
          {
            id: newConvId,
            listing_id: isUuid(listingId) ? listingId : null,
            participant1_id: user.id,
            participant2_id: targetUserId,
            subject: resolvedSubject,
            last_message_text: 'Started conversation',
            last_message_at: nowIso,
          },
        ]);
      } catch {
        // ignore
      }
    }

    const newConv: Conversation = {
      id: newConvId,
      listing_id: listingId || undefined,
      listing: targetListing,
      participant1_id: user?.id || 'guest',
      participant1: user || undefined,
      participant2_id: targetUserId,
      participant2: partner,
      subject: resolvedSubject,
      last_message_text: 'Started conversation',
      last_message_at: nowIso,
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    return newConvId;
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    type: Message['message_type'] = 'text',
    metadata?: Record<string, any>
  ): Promise<void> => {
    const newMsgId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user?.id && isUuid(conversationId)) {
      try {
        await supabase.from('messages').insert([
          {
            id: newMsgId,
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            message_type: type,
            metadata: metadata || {},
            is_read: false,
          },
        ]);
      } catch {
        // ignore
      }
    }

    const newMsg: Message = {
      id: newMsgId,
      conversation_id: conversationId,
      sender_id: user?.id || 'guest',
      sender: user || undefined,
      content,
      message_type: type,
      metadata,
      is_read: true,
      created_at: nowIso,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message_text: content,
              last_message_at: nowIso,
            }
          : c
      )
    );
  };

  // =========================================================================
  // RENTAL REQUESTS
  // =========================================================================
  const createRentalRequest = async (
    reqData: Omit<RentalRequest, 'id' | 'renter_id' | 'status' | 'created_at'>
  ): Promise<RentalRequest> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to request a rental.');
    }
    const newId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && isUuid(reqData.listing_id)) {
      await ensureCurrentUserProfileRow();
      const { error } = await supabase.from('rental_requests').insert([
        {
          id: newId,
          listing_id: reqData.listing_id,
          renter_id: user.id,
          owner_id: reqData.owner_id,
          start_date: reqData.start_date,
          end_date: reqData.end_date,
          duration_type: reqData.duration_type,
          total_amount: reqData.total_amount,
          status: 'pending',
          message: reqData.message || '',
        },
      ]);
      if (error) {
        console.warn('[NARMIS] Rental request Supabase notice:', error.message);
      }
    }

    const newReq: RentalRequest = {
      ...reqData,
      id: newId,
      renter_id: user.id,
      renter: user,
      status: 'pending',
      created_at: nowIso,
    };

    setRentalRequests((prev) => [newReq, ...prev]);

    const convId = await startOrGetConversation(
      reqData.listing_id,
      reqData.owner_id,
      `Rental Request: ${reqData.listing?.title || 'Item Rental'}`
    );

    await sendMessage(
      convId,
      `Requested Rental: ${reqData.duration_units} ${reqData.duration_type} (From ${reqData.start_date} to ${reqData.end_date}) for ₹${reqData.total_amount}. Note: ${reqData.message}`,
      'rental_offer',
      {
        startDate: reqData.start_date,
        endDate: reqData.end_date,
        totalAmount: reqData.total_amount,
        status: 'pending',
      }
    );

    return newReq;
  };

  const updateRentalStatus = async (
    id: string,
    status: RentalRequest['status']
  ): Promise<void> => {
    if (isSupabaseConfigured && supabase && isUuid(id)) {
      try {
        await supabase.from('rental_requests').update({ status }).eq('id', id);
      } catch {
        // ignore
      }
    }

    let targetReq: RentalRequest | undefined;
    setRentalRequests((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetReq = { ...item, status };
          return targetReq;
        }
        return item;
      })
    );

    if (targetReq) {
      const conv = conversations.find(
        (c) =>
          c.listing_id === targetReq?.listing_id &&
          ((c.participant1_id === targetReq?.renter_id &&
            c.participant2_id === targetReq?.owner_id) ||
            (c.participant2_id === targetReq?.renter_id &&
              c.participant1_id === targetReq?.owner_id))
      );
      if (conv) {
        const statusLabel =
          status === 'approved'
            ? '🎉 [RENTAL APPROVED & CONFIRMED] Seller confirmed the reservation! Arrange pickup in chat.'
            : status === 'rejected'
            ? '❌ [RENTAL DECLINED] The booking was declined by the owner.'
            : `[RENTAL UPDATE] Booking status updated to ${status}.`;

        await sendMessage(conv.id, statusLabel, 'system', {
          action: 'rental_status_update',
          rentalId: id,
          status,
        });

        setMessages((prev) => {
          const convMsgs = prev[conv.id] || [];
          return {
            ...prev,
            [conv.id]: convMsgs.map((m) =>
              m.message_type === 'rental_offer'
                ? { ...m, metadata: { ...m.metadata, status } }
                : m
            ),
          };
        });
      }
    }
  };

  // =========================================================================
  // TRADE OFFERS & TRADE SUBSCRIPTION SYSTEM
  // =========================================================================
  const createTradeOffer = async (
    offerData: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>
  ): Promise<TradeOffer> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to propose a trade.');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    await ensureCurrentUserProfileRow();

    // Check current server-side trade allowance before proceeding
    const currentAccess = await refreshTradeAccess();
    if (!currentAccess.can_trade) {
      throw new Error(
        'TRADE_SUBSCRIPTION_REQUIRED: You have used all 3 free trade trials. Upgrade to the NARMIS Annual Trade Pass (₹299/year) to continue proposing trades.'
      );
    }

    let newId: string = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isUuid(offerData.listing_id)) {
      // 1. Primary path: atomic server-side RPC create_trade_offer()
      const { data: rpcOffer, error: rpcErr } = await supabase.rpc('create_trade_offer', {
        p_listing_id: offerData.listing_id,
        p_offered_item_title: offerData.offered_item_title,
        p_offered_item_description: offerData.offered_item_description,
        p_offered_item_image: offerData.offered_item_image || null,
        p_offered_item_value: offerData.offered_item_value,
        p_cash_adjustment: offerData.cash_adjustment || 0,
        p_negotiation_notes: offerData.negotiation_notes || null,
        p_terms_accepted: true,
      });

      if (rpcErr) {
        if (/TRADE_SUBSCRIPTION_REQUIRED/i.test(rpcErr.message)) {
          await refreshTradeAccess();
          throw new Error(
            'TRADE_SUBSCRIPTION_REQUIRED: You have used all 3 free trade trials. An annual subscription (₹299/year) is required.'
          );
        }
        // If the RPC doesn't exist yet (PGRST202), verify trial count on trade_offers and insert
        if (rpcErr.code === 'PGRST202' || /could not find the function/i.test(rpcErr.message)) {
          const { count } = await supabase
            .from('trade_offers')
            .select('id', { count: 'exact', head: true })
            .eq('requester_id', user.id);
          if ((count ?? 0) >= 3 && !currentAccess.subscription_active) {
            throw new Error(
              'TRADE_SUBSCRIPTION_REQUIRED: You have used all 3 free trade trials. An annual subscription (₹299/year) is required.'
            );
          }
          const { error: insErr } = await supabase.from('trade_offers').insert([
            {
              id: newId,
              listing_id: offerData.listing_id,
              requester_id: user.id,
              owner_id: offerData.owner_id,
              offered_item_title: offerData.offered_item_title,
              offered_item_description: offerData.offered_item_description,
              offered_item_image: offerData.offered_item_image || null,
              offered_item_value: offerData.offered_item_value,
              cash_adjustment: offerData.cash_adjustment || 0,
              status: 'pending',
              negotiation_notes: offerData.negotiation_notes || null,
            },
          ]);
          if (insErr) {
            throw new Error(`Failed to submit trade offer: ${insErr.message}`);
          }
        } else {
          throw new Error(rpcErr.message);
        }
      } else if (rpcOffer?.id) {
        newId = rpcOffer.id;
      }
    } else {
      // Static showcase item trade offer: still enforce server-side trial count for this user
      const { count } = await supabase
        .from('trade_offers')
        .select('id', { count: 'exact', head: true })
        .eq('requester_id', user.id);
      const usedCount = Math.max(currentAccess.free_trials_used, count ?? 0);
      if (usedCount >= 3 && !currentAccess.subscription_active) {
        throw new Error(
          'TRADE_SUBSCRIPTION_REQUIRED: You have used all 3 free trade trials. An annual subscription (₹299/year) is required.'
        );
      }
    }

    const newOffer: TradeOffer = {
      ...offerData,
      id: newId,
      requester_id: user.id,
      requester: user,
      status: 'pending',
      created_at: nowIso,
    };

    setTradeOffers((prev) => [newOffer, ...prev]);
    await refreshTradeAccess();

    const convId = await startOrGetConversation(
      offerData.listing_id,
      offerData.owner_id,
      `Trade Offer: ${offerData.offered_item_title}`
    );

    const adjustmentText =
      offerData.cash_adjustment > 0
        ? ` + ₹${offerData.cash_adjustment} cash`
        : offerData.cash_adjustment < 0
        ? ` (requesting ₹${Math.abs(offerData.cash_adjustment)} cash)`
        : ` (even trade)`;

    await sendMessage(
      convId,
      `Trade Proposal: I am offering "${offerData.offered_item_title}" (est. ₹${offerData.offered_item_value})${adjustmentText}. ${offerData.negotiation_notes || ''}`,
      'trade_offer',
      {
        offeredItem: offerData.offered_item_title,
        estimatedValue: offerData.offered_item_value,
        cashAdjustment: offerData.cash_adjustment,
        status: 'pending',
      }
    );

    return newOffer;
  };

  const updateTradeStatus = async (
    id: string,
    status: TradeOffer['status']
  ): Promise<void> => {
    if (isSupabaseConfigured && supabase && isUuid(id)) {
      try {
        await supabase.from('trade_offers').update({ status }).eq('id', id);
      } catch {
        // ignore
      }
    }

    let targetTrade: TradeOffer | undefined;
    setTradeOffers((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetTrade = { ...item, status };
          return targetTrade;
        }
        return item;
      })
    );

    if (targetTrade) {
      const conv = conversations.find(
        (c) =>
          c.listing_id === targetTrade?.listing_id &&
          ((c.participant1_id === targetTrade?.requester_id &&
            c.participant2_id === targetTrade?.owner_id) ||
            (c.participant2_id === targetTrade?.requester_id &&
              c.participant1_id === targetTrade?.owner_id))
      );
      if (conv) {
        const statusLabel =
          status === 'accepted'
            ? '🤝 [TRADE AGREEMENT CONFIRMED] Exchange proposal accepted by both parties!'
            : status === 'rejected'
            ? '❌ [TRADE REJECTED] The trade proposal was declined.'
            : `[TRADE UPDATE] Status updated to ${status}.`;

        await sendMessage(conv.id, statusLabel, 'system', {
          action: 'trade_status_update',
          tradeId: id,
          status,
        });

        setMessages((prev) => {
          const convMsgs = prev[conv.id] || [];
          return {
            ...prev,
            [conv.id]: convMsgs.map((m) =>
              m.message_type === 'trade_offer'
                ? { ...m, metadata: { ...m.metadata, status } }
                : m
            ),
          };
        });
      }
    }
  };

  const recordSubscriptionPaymentSubmission = async ({
    paymentReference,
  }: {
    paymentReference: string;
  }): Promise<SubscriptionPayment> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to submit a subscription payment.');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const cleanRef = paymentReference.trim();
    if (!cleanRef || cleanRef.length < 6) {
      throw new Error('Please enter a valid UPI transaction reference / UTR (at least 6 characters).');
    }

    await ensureCurrentUserProfileRow();

    const { data, error } = await supabase.rpc('submit_trade_subscription_payment', {
      p_upi_reference: cleanRef,
    });

    if (error) {
      if (error.code === 'PGRST202' || /could not find the function/i.test(error.message)) {
        throw new Error(
          'Subscription payment database function is not installed yet. Please run migration 20261123_04_upi_trade_pass_admin_verification.sql in Supabase SQL Editor.'
        );
      }
      throw new Error(error.message || 'Unable to submit UPI transaction reference.');
    }

    const created: SubscriptionPayment = {
      ...(data as any),
      upi_reference: (data as any).upi_reference || cleanRef,
      verification_status: (data as any).verification_status || 'Pending Verification',
    };

    await refreshTradeAccess();
    return created;
  };

  // =========================================================================
  // PURCHASE & CART CHECKOUT
  // =========================================================================
  const checkoutCart = async ({
    address,
    paymentReference,
  }: {
    address: string;
    paymentReference?: string;
  }): Promise<PurchaseTransaction[]> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to complete checkout.');
    }
    if (!address || address.trim().length < 3) {
      throw new Error('Please provide a valid delivery or campus handover address.');
    }

    const validItems = resolvedCartItems.filter((ci) => {
      const l = ci.listing;
      return (
        l &&
        l.status === 'active' &&
        l.listing_type === 'purchase' &&
        l.user_id !== user.id &&
        ci.quantity >= 1 &&
        ci.quantity <= (l.quantity_available ?? 1)
      );
    });

    if (validItems.length === 0) {
      throw new Error(
        'Your cart has no active, available purchase items. Please remove any unavailable items and try again.'
      );
    }

    const cleanAddress = address.trim();
    const cleanRef = paymentReference?.trim() || undefined;
    const nowIso = new Date().toISOString();
    const createdTransactions: PurchaseTransaction[] = [];

    if (isSupabaseConfigured && supabase) {
      await ensureCurrentUserProfileRow();

      const uuidItems = validItems.filter((vi) => isUuid(vi.listing_id));
      if (uuidItems.length > 0) {
        const rpcPayload = uuidItems.map((vi) => ({
          listing_id: vi.listing_id,
          quantity: vi.quantity,
        }));

        const { data: rpcPurchases, error: rpcErr } = await supabase.rpc('checkout_purchase', {
          p_items: rpcPayload,
          p_address: cleanAddress,
          p_payment_reference: cleanRef || null,
          p_clear_cart: true,
        });

        if (!rpcErr && Array.isArray(rpcPurchases)) {
          for (const row of rpcPurchases) {
            const matchedListing = listings.find((l) => l.id === row.listing_id);
            createdTransactions.push({
              id: row.id,
              listing_id: row.listing_id,
              listing: matchedListing,
              buyer_id: user.id,
              buyer: user,
              seller_id: row.seller_id,
              seller: matchedListing?.user,
              amount: Number(row.amount) || 0,
              quantity: Number(row.quantity) || 1,
              unit_price: row.unit_price ? Number(row.unit_price) : undefined,
              checkout_group_id: row.checkout_group_id,
              status: 'payment_submitted',
              payment_method: 'UPI QR Payment',
              payment_reference: cleanRef,
              payment_confirmed_by_buyer: true,
              payment_confirmed_at: nowIso,
              payment_verification_status: 'Payment Submitted',
              receipt_number: row.receipt_number,
              shipping_address: cleanAddress,
              created_at: row.created_at || nowIso,
            });
          }
        } else if (rpcErr && rpcErr.code !== 'PGRST202') {
          throw new Error(rpcErr.message);
        }
      }
    }

    // Handle any remaining items (or when checkout_purchase RPC hasn't been executed yet)
    const processedListingIds = new Set(createdTransactions.map((t) => t.listing_id));
    for (const item of validItems) {
      if (processedListingIds.has(item.listing_id)) continue;
      const targetListing = item.listing!;
      const receiptNumber = 'NRM-' + Math.floor(100000 + Math.random() * 900000);
      const unitPrice = Number(targetListing.purchase_price) || 0;
      const lineAmount = unitPrice * item.quantity;

      const tx: PurchaseTransaction = {
        id: crypto.randomUUID(),
        listing_id: targetListing.id,
        listing: targetListing,
        buyer_id: user.id,
        buyer: user,
        seller_id: targetListing.user_id,
        seller: targetListing.user,
        amount: lineAmount,
        quantity: item.quantity,
        unit_price: unitPrice,
        status: 'payment_submitted',
        payment_method: 'UPI QR Payment',
        payment_reference: cleanRef,
        payment_confirmed_by_buyer: true,
        payment_confirmed_at: nowIso,
        payment_verification_status: 'Payment Submitted',
        receipt_number: receiptNumber,
        shipping_address: cleanAddress,
        created_at: nowIso,
      };

      if (isSupabaseConfigured && supabase && isUuid(targetListing.id)) {
        try {
          await supabase.from('purchases').insert([
            {
              id: tx.id,
              listing_id: targetListing.id,
              buyer_id: user.id,
              seller_id: targetListing.user_id,
              amount: lineAmount,
              status: 'payment_submitted',
              payment_method: 'UPI_QR',
              payment_reference: cleanRef || null,
              payment_confirmed_by_buyer: true,
              payment_confirmed_at: nowIso,
              payment_verification_status: 'Payment Submitted',
              receipt_number: receiptNumber,
              shipping_address: cleanAddress,
            },
          ]);
        } catch {
          // ignore if direct insert is revoked in favor of RPC
        }
      }

      createdTransactions.push(tx);
    }

    // Update local state & notify sellers
    const purchasedIds = new Set(createdTransactions.map((t) => t.listing_id));
    setPurchases((prev) => [...createdTransactions, ...prev]);
    setListings((prev) =>
      prev.map((l) => (purchasedIds.has(l.id) ? { ...l, status: 'pending' } : l))
    );
    setCartItems((prev) => prev.filter((c) => !purchasedIds.has(c.listing_id)));

    if (isSupabaseConfigured && supabase && user?.id) {
      for (const lid of purchasedIds) {
        if (isUuid(lid)) {
          try {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
              .eq('listing_id', lid);
          } catch {
            // ignore
          }
        }
      }
    }

    for (const tx of createdTransactions) {
      if (!tx.listing) continue;
      const convId = await startOrGetConversation(
        tx.listing_id,
        tx.seller_id,
        `Payment Submitted: ${tx.listing.title}`
      );
      const refSuffix = cleanRef ? ` · UPI Ref: ${cleanRef}` : '';
      await sendMessage(
        convId,
        `Payment confirmation submitted (Ref: ${tx.receipt_number}${refSuffix}). Qty: ${
          tx.quantity || 1
        } · Amount: ₹${tx.amount.toLocaleString(
          'en-IN'
        )}. Handover address: ${cleanAddress}. Awaiting seller verification.`,
        'system',
        {
          receiptNumber: tx.receipt_number,
          amount: tx.amount,
          quantity: tx.quantity || 1,
          paymentReference: cleanRef,
        }
      );
    }

    await refreshListings();
    return createdTransactions;
  };

  const submitPurchasePayment = async ({
    listingId,
    address,
    paymentReference,
  }: {
    listingId: string;
    address: string;
    paymentReference?: string;
  }): Promise<PurchaseTransaction> => {
    if (!user || !session?.access_token) {
      throw new Error('Please log in to complete this purchase.');
    }
    const targetListing = getListing(listingId);
    if (!targetListing) throw new Error('Listing not found.');
    if (targetListing.status !== 'active') {
      throw new Error('This listing is no longer available for purchase.');
    }
    if (targetListing.user_id === user.id) {
      throw new Error('You cannot purchase your own listing.');
    }

    const cleanAddress = address.trim() || DEFAULT_CAMPUS_LOCATION;
    const cleanRef = paymentReference?.trim() || undefined;
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && isUuid(listingId)) {
      await ensureCurrentUserProfileRow();
      const { data: rpcPurchases, error: rpcErr } = await supabase.rpc('checkout_purchase', {
        p_items: [{ listing_id: listingId, quantity: 1 }],
        p_address: cleanAddress,
        p_payment_reference: cleanRef || null,
        p_clear_cart: true,
      });

      if (!rpcErr && Array.isArray(rpcPurchases) && rpcPurchases[0]) {
        const row = rpcPurchases[0];
        const newPurchase: PurchaseTransaction = {
          id: row.id,
          listing_id: listingId,
          listing: targetListing,
          buyer_id: user.id,
          buyer: user,
          seller_id: targetListing.user_id,
          seller: targetListing.user,
          amount: Number(row.amount) || targetListing.purchase_price || 0,
          quantity: 1,
          unit_price: targetListing.purchase_price,
          checkout_group_id: row.checkout_group_id,
          status: 'payment_submitted',
          payment_method: 'UPI QR Payment',
          payment_reference: cleanRef,
          payment_confirmed_by_buyer: true,
          payment_confirmed_at: nowIso,
          payment_verification_status: 'Payment Submitted',
          receipt_number: row.receipt_number,
          shipping_address: cleanAddress,
          created_at: row.created_at || nowIso,
        };

        setPurchases((prev) => [newPurchase, ...prev]);
        setListings((prev) =>
          prev.map((item) => (item.id === listingId ? { ...item, status: 'pending' } : item))
        );
        setCartItems((prev) => prev.filter((c) => c.listing_id !== listingId));

        const convId = await startOrGetConversation(
          listingId,
          targetListing.user_id,
          `Payment Submitted: ${targetListing.title}`
        );
        const refSuffix = cleanRef ? ` · UPI Ref: ${cleanRef}` : '';
        await sendMessage(
          convId,
          `Payment confirmation submitted (Ref: ${newPurchase.receipt_number}${refSuffix}). Amount: ₹${newPurchase.amount.toLocaleString('en-IN')}. Handover address: ${cleanAddress}. Awaiting seller verification.`,
          'system',
          { receiptNumber: newPurchase.receipt_number, amount: newPurchase.amount, paymentReference: cleanRef }
        );

        await refreshListings();
        return newPurchase;
      } else if (rpcErr && rpcErr.code !== 'PGRST202') {
        throw new Error(rpcErr.message);
      }
    }

    const receiptNumber = 'NRM-' + Math.floor(100000 + Math.random() * 900000);
    const newPurchase: PurchaseTransaction = {
      id: crypto.randomUUID(),
      listing_id: listingId,
      listing: targetListing,
      buyer_id: user.id,
      buyer: user,
      seller_id: targetListing.user_id,
      seller: targetListing.user,
      amount: targetListing.purchase_price || 0,
      quantity: 1,
      unit_price: targetListing.purchase_price,
      status: 'payment_submitted',
      payment_method: 'UPI QR Payment',
      payment_reference: cleanRef,
      payment_confirmed_by_buyer: true,
      payment_confirmed_at: nowIso,
      payment_verification_status: 'Payment Submitted',
      receipt_number: receiptNumber,
      shipping_address: cleanAddress,
      created_at: nowIso,
    };

    if (isSupabaseConfigured && supabase && isUuid(listingId)) {
      try {
        await supabase.from('purchases').insert([
          {
            id: newPurchase.id,
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: targetListing.user_id,
            amount: newPurchase.amount,
            status: 'payment_submitted',
            payment_method: 'UPI_QR',
            payment_reference: cleanRef || null,
            payment_confirmed_by_buyer: true,
            payment_confirmed_at: nowIso,
            payment_verification_status: 'Payment Submitted',
            receipt_number: receiptNumber,
            shipping_address: cleanAddress,
          },
        ]);
      } catch {
        // ignore
      }
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, status: 'pending' } : item))
    );
    setCartItems((prev) => prev.filter((c) => c.listing_id !== listingId));

    const convId = await startOrGetConversation(
      listingId,
      targetListing.user_id,
      `Payment Submitted: ${targetListing.title}`
    );

    const refSuffix = cleanRef ? ` · UPI Ref: ${cleanRef}` : '';
    await sendMessage(
      convId,
      `Payment confirmation submitted (Ref: ${receiptNumber}${refSuffix}). Amount: ₹${newPurchase.amount.toLocaleString('en-IN')}. Handover address: ${cleanAddress}. Awaiting seller verification.`,
      'system',
      { receiptNumber, amount: newPurchase.amount, paymentReference: cleanRef }
    );

    return newPurchase;
  };

  const addCommunityRequest = async (
    requestData: Omit<CommunityRequest, 'id' | 'created_at' | 'user' | 'user_id'>
  ): Promise<CommunityRequest> => {
    const newId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await ensureCurrentUserProfileRow();
        await supabase.from('community_requests').insert([
          {
            id: newId,
            user_id: user.id,
            item_name: requestData.item_name,
            category: requestData.category || 'Other',
            listing_type: requestData.listing_type || 'rent',
            details: requestData.details || null,
          },
        ]);
      } catch {
        // ignore
      }
    }

    const newReq: CommunityRequest = {
      ...requestData,
      id: newId,
      user_id: user?.id || 'guest-user',
      user: user || DEMO_PROFILES[0],
      created_at: nowIso,
    };

    setCommunityRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const confirmDealInChat = async (
    conversationId: string,
    dealType: 'rental' | 'trade',
    notes?: string
  ): Promise<void> => {
    const conv = conversations.find((c) => c.id === conversationId);

    if (dealType === 'rental' && conv?.listing_id) {
      setRentalRequests((prev) =>
        prev.map((r) => (r.listing_id === conv.listing_id ? { ...r, status: 'approved' } : r))
      );
    } else if (dealType === 'trade' && conv?.listing_id) {
      setTradeOffers((prev) =>
        prev.map((t) => (t.listing_id === conv.listing_id ? { ...t, status: 'accepted' } : t))
      );
    }

    const confirmText =
      dealType === 'rental'
        ? `🎉 [RENTAL CONFIRMED & APPROVED] ${user?.full_name || 'Owner'} has officially approved this rental reservation! ${notes ? `Notes: ${notes}` : 'Arranging meetup & handover.'}`
        : `🤝 [TRADE DEAL CONFIRMED] ${user?.full_name || 'Owner'} has accepted and finalized this trade exchange! ${notes ? `Notes: ${notes}` : 'Handover & cash offset confirmed.'}`;

    await sendMessage(conversationId, confirmText, 'system', {
      action: 'deal_confirmed',
      dealType,
      confirmedAt: new Date().toISOString(),
      confirmedBy: user?.full_name,
    });

    setMessages((prev) => {
      const convMsgs = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: convMsgs.map((m) =>
          m.metadata && (m.message_type === 'rental_offer' || m.message_type === 'trade_offer')
            ? { ...m, metadata: { ...m.metadata, status: 'approved' } }
            : m
        ),
      };
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        isLoadingListings,
        isLocalListingMode: USE_LOCAL_LISTING_STORAGE,
        refreshListings,
        fetchListingById,
        savedIds,
        rentalRequests,
        tradeOffers,
        purchases,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        communityRequests,
        addCommunityRequest,
        confirmDealInChat,
        reviews,
        getListingReviews,
        addReview,
        hasUserCompletedTransaction,
        addListing,
        updateListing,
        deleteListing,
        toggleSaveListing,
        isSaved,
        getListing,
        createRentalRequest,
        updateRentalStatus,
        tradeAccess,
        isLoadingTradeAccess,
        isAdmin,
        subscriptionPayments,
        adminSubscriptionPayments,
        refreshTradeAccess,
        refreshAdminSubscriptionPayments,
        reviewSubscriptionPayment,
        createTradeOffer,
        updateTradeStatus,
        recordSubscriptionPaymentSubmission,
        cartItems: resolvedCartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        submitPurchasePayment,
        sendMessage,
        startOrGetConversation,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
