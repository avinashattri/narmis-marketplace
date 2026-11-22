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
import { DEFAULT_CAMPUS_LOCATION } from '../services/locationDefaults';

interface MarketplaceContextType {
  listings: Listing[];
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

  // Actions
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

  // Trade actions
  createTradeOffer: (
    offer: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>
  ) => Promise<TradeOffer>;
  updateTradeStatus: (id: string, status: TradeOffer['status']) => Promise<void>;

  // Purchase action
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

const DATA_VERSION = 'v9';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (typeof window !== 'undefined') {
    const isFreshVersion = localStorage.getItem('narmis_version') === DATA_VERSION;
    if (!isFreshVersion) {
      localStorage.setItem('narmis_version', DATA_VERSION);
      // If cached listings was accidentally emptied during migration, reset to full catalog
      try {
        const rawListings = localStorage.getItem('narmis_listings');
        const parsed = rawListings ? JSON.parse(rawListings) : null;
        if (!Array.isArray(parsed) || parsed.length === 0) {
          localStorage.removeItem('narmis_listings');
        }
      } catch {
        localStorage.removeItem('narmis_listings');
      }
    }
  }

  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_listings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fall through
    }
    return INITIAL_LISTINGS;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_saved_ids');
      return cached ? JSON.parse(cached) : ['list-vipan-1', 'list-shraddha-1'];
    } catch {
      return [];
    }
  });

  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_rental_requests');
      return cached ? JSON.parse(cached) : INITIAL_RENTAL_REQUESTS;
    } catch {
      return INITIAL_RENTAL_REQUESTS;
    }
  });

  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_trade_offers');
      return cached ? JSON.parse(cached) : INITIAL_TRADE_OFFERS;
    } catch {
      return INITIAL_TRADE_OFFERS;
    }
  });

  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_purchases');
      return cached ? JSON.parse(cached) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_conversations');
      return cached ? JSON.parse(cached) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const cached = localStorage.getItem('narmis_messages');
      return cached ? JSON.parse(cached) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_community_requests');
      return cached ? JSON.parse(cached) : INITIAL_COMMUNITY_REQUESTS;
    } catch {
      return INITIAL_COMMUNITY_REQUESTS;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const cached = localStorage.getItem('narmis_reviews');
      return cached ? JSON.parse(cached) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');

  useEffect(() => {
    localStorage.setItem('narmis_listings', JSON.stringify(listings));
  }, [listings]);
  useEffect(() => {
    localStorage.setItem('narmis_reviews', JSON.stringify(reviews));
  }, [reviews]);
  useEffect(() => {
    localStorage.setItem('narmis_community_requests', JSON.stringify(communityRequests));
  }, [communityRequests]);
  useEffect(() => {
    localStorage.setItem('narmis_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);
  useEffect(() => {
    localStorage.setItem('narmis_rental_requests', JSON.stringify(rentalRequests));
  }, [rentalRequests]);
  useEffect(() => {
    localStorage.setItem('narmis_trade_offers', JSON.stringify(tradeOffers));
  }, [tradeOffers]);
  useEffect(() => {
    localStorage.setItem('narmis_purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem('narmis_conversations', JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    localStorage.setItem('narmis_messages', JSON.stringify(messages));
  }, [messages]);

  const mapDbListing = (l: any): Listing => {
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
              'https://ui-avatars.com/api/?name=Member&background=304943&color=EAD3AA',
            bio: l.profiles.bio,
            location: l.profiles.location || l.location,
            college_name: l.profiles.college_name,
            college_verification_status:
              l.profiles.college_verification_status || 'Not Submitted',
            rating: l.profiles.rating || 5.0,
            review_count: l.profiles.review_count || 0,
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
      original_mrp: l.original_mrp ?? undefined,
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
      rental_price: l.rental_price ?? undefined,
      rental_duration: l.rental_duration ?? undefined,
      availability_status: l.availability_status || 'available',
      estimated_value: l.estimated_value ?? undefined,
      trade_desired: l.trade_desired ?? undefined,
      trade_cash_adjustment: l.trade_cash_adjustment ?? undefined,
      purchase_price: l.purchase_price ?? undefined,
      images: imgsOf('product'),
      location: l.location || DEFAULT_CAMPUS_LOCATION,
      status: l.status,
      featured: l.featured,
      view_count: l.view_count || 0,
      created_at: l.created_at,
    };
  };

  // Sync with Supabase tables when available (never wiping existing catalog on empty/unmigrated DB)
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    try {
      const { data: dbListings, error: listErr } = await client
        .from('listings')
        .select('*, profiles(*), listing_images(*)')
        .order('created_at', { ascending: false });

      if (!listErr && dbListings && dbListings.length > 0) {
        const mapped = dbListings.map(mapDbListing);
        setListings((prev) => {
          const dbIds = new Set(mapped.map((m) => m.id));
          const dbTitles = new Set(mapped.map((m) => m.title.trim().toLowerCase()));
          const preserved = prev.filter(
            (item) => !dbIds.has(item.id) && !dbTitles.has(item.title.trim().toLowerCase())
          );
          return [...mapped, ...preserved];
        });
      }
    } catch (err) {
      console.warn('Supabase listings sync notice:', err);
    }

    if (user?.id) {
      try {
        const { data: savedRows, error: savedErr } = await client
          .from('saved_listings')
          .select('listing_id')
          .eq('user_id', user.id);
        if (!savedErr && savedRows && savedRows.length > 0) {
          setSavedIds((prev) =>
            Array.from(new Set([...prev, ...savedRows.map((s: any) => s.listing_id)]))
          );
        }
      } catch {
        // table not migrated yet
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  // Realtime subscription for incoming messages when Supabase is active
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;
    const client = supabase;

    const channel = client
      .channel(`narmis-messages-${user.id}`)
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
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id]);

  const getListing = (id: string): Listing | undefined => {
    return listings.find((l) => l.id === id);
  };

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

  const addReview = async (
    reviewData: Omit<Review, 'id' | 'created_at'>
  ): Promise<Review> => {
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
      try {
        await supabase.from('reviews').insert([
          {
            id: newRev.id,
            reviewer_id: newRev.reviewer_id,
            target_user_id: newRev.target_user_id,
            listing_id: newRev.listing_id,
            rating: newRev.rating,
            comment: newRev.comment,
          },
        ]);
      } catch (e) {
        console.warn('Supabase review insert fallback:', e);
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
      if (error) console.warn('Supabase listing_images sync notice:', error.message);
    }
  };

  const addListing = async (
    data: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'view_count' | 'status'>
  ): Promise<Listing> => {
    if (!user) throw new Error('Please log in to create a listing.');

    const newId = crypto.randomUUID();
    const newListing: Listing = {
      ...data,
      id: newId,
      user_id: user.id,
      user,
      status: 'active',
      view_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('listings')
          .insert([{ id: newId, user_id: user.id, ...toListingRow({ ...data, status: 'active' }) }]);
        if (!error) {
          await replaceListingImages(newId, data.images || [], data.condition_images || []);
        } else {
          console.warn('Supabase insert listing notice (saved locally):', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert listing fallback:', err);
      }
    }

    setListings((prev) => [newListing, ...prev]);
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

    if (isSupabaseConfigured && supabase && isOwner) {
      try {
        const row = toListingRow(safeUpdates);
        if (Object.keys(row).length) {
          await supabase.from('listings').update(row).eq('id', id).eq('user_id', user.id);
        }
        if (safeUpdates.images || safeUpdates.condition_images) {
          await replaceListingImages(id, safeUpdates.images, safeUpdates.condition_images);
        }
      } catch (err) {
        console.warn('Supabase update listing fallback:', err);
      }
    }

    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...safeUpdates } : item))
    );
  };

  const deleteListing = async (id: string): Promise<void> => {
    const existing = listings.find((l) => l.id === id);
    if (!existing || !user || existing.user_id !== user.id) return;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('listings').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase delete listing notice:', err);
      }
    }
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleSaveListing = async (id: string): Promise<void> => {
    const currentlySaved = savedIds.includes(id);
    setSavedIds((prev) => (currentlySaved ? prev.filter((i) => i !== id) : [...prev, id]));

    if (isSupabaseConfigured && supabase && user?.id) {
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
        // ignore if saved_listings table not migrated yet
      }
    }
  };

  const isSaved = (id: string) => savedIds.includes(id);

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

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('conversations').insert([
          {
            id: newConvId,
            listing_id: listingId && /^[0-9a-f-]{36}$/i.test(listingId) ? listingId : null,
            participant1_id: user.id,
            participant2_id: targetUserId,
            subject: resolvedSubject,
            last_message_text: 'Started conversation',
            last_message_at: nowIso,
          },
        ]);
      } catch {
        // ignore if conversations table not migrated or non-UUID demo profile
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

    if (
      isSupabaseConfigured &&
      supabase &&
      user?.id &&
      /^[0-9a-f-]{36}$/i.test(conversationId)
    ) {
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
        // ignore if messages table not migrated yet
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

  const createRentalRequest = async (
    reqData: Omit<RentalRequest, 'id' | 'renter_id' | 'status' | 'created_at'>
  ): Promise<RentalRequest> => {
    const newId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('rental_requests').insert([
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
      } catch {
        // fallback to local persistence if table not migrated yet
      }
    }

    const newReq: RentalRequest = {
      ...reqData,
      id: newId,
      renter_id: user?.id || 'guest',
      renter: user || undefined,
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
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(id)) {
      try {
        await supabase.from('rental_requests').update({ status }).eq('id', id);
      } catch {
        // ignore if not in remote table
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

  const createTradeOffer = async (
    offerData: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>
  ): Promise<TradeOffer> => {
    const newId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('trade_offers').insert([
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
      } catch {
        // fallback to local persistence if table not migrated yet
      }
    }

    const newOffer: TradeOffer = {
      ...offerData,
      id: newId,
      requester_id: user?.id || 'guest',
      requester: user || undefined,
      status: 'pending',
      created_at: nowIso,
    };

    setTradeOffers((prev) => [newOffer, ...prev]);

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
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(id)) {
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

  const submitPurchasePayment = async ({
    listingId,
    address,
    paymentReference,
  }: {
    listingId: string;
    address: string;
    paymentReference?: string;
  }): Promise<PurchaseTransaction> => {
    const targetListing = getListing(listingId);
    if (!targetListing) throw new Error('Listing not found');

    const receiptNumber = 'NRM-' + Math.floor(100000 + Math.random() * 900000);
    const nowIso = new Date().toISOString();
    const cleanRef = paymentReference?.trim() || undefined;

    const newPurchase: PurchaseTransaction = {
      id: crypto.randomUUID(),
      listing_id: listingId,
      listing: targetListing,
      buyer_id: user?.id || 'guest-buyer',
      buyer: user || undefined,
      seller_id: targetListing.user_id,
      seller: targetListing.user,
      amount: targetListing.purchase_price || 0,
      status: 'payment_submitted',
      payment_method: 'UPI QR Payment',
      payment_reference: cleanRef,
      payment_confirmed_by_buyer: true,
      payment_confirmed_at: nowIso,
      payment_verification_status: 'Payment Submitted',
      receipt_number: receiptNumber,
      shipping_address: address,
      created_at: nowIso,
    };

    if (isSupabaseConfigured && supabase && user?.id) {
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
            shipping_address: address,
          },
        ]);
      } catch (err) {
        console.warn('Supabase purchase record fallback to local cache:', err);
      }
    }

    setPurchases((prev) => [newPurchase, ...prev]);

    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, status: 'pending' } : item))
    );

    const convId = await startOrGetConversation(
      listingId,
      targetListing.user_id,
      `Payment Submitted: ${targetListing.title}`
    );

    const refSuffix = cleanRef ? ` · UPI Ref: ${cleanRef}` : '';
    await sendMessage(
      convId,
      `Payment confirmation submitted (Ref: ${receiptNumber}${refSuffix}). Amount: ₹${newPurchase.amount.toLocaleString('en-IN')}. Handover address: ${address}. Awaiting seller verification.`,
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
        // fallback if table not migrated yet
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
        createTradeOffer,
        updateTradeStatus,
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
