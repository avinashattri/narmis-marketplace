export type ListingType = 'rent' | 'trade' | 'purchase';

export type ListingCondition = 'Brand New' | 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';

export type DefectType =
  | 'No visible damage'
  | 'Minor scratches'
  | 'Major scratches'
  | 'Dents or physical marks'
  | 'Cracks or broken parts'
  | 'Functional issues'
  | 'Other';

export type ListingCategory =
  | 'Electronics'
  | 'Computers and Accessories'
  | 'Books'
  | 'Tools and Equipment'
  | 'Photography'
  | 'Gaming'
  | 'Sports Equipment'
  | 'Cricket Equipment'
  | 'Fashion & Apparel'
  | 'Furniture'
  | 'Other';

export type CollegeVerificationStatus =
  | 'Not Submitted'
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  college_name?: string;
  college_verification_status?: CollegeVerificationStatus;
  college_submitted_at?: string;
  college_verified_at?: string;
  // Private owner-only fields (never populated on public profile reads)
  college_id_number?: string;
  college_id_image?: string;
  rating?: number;
  review_count?: number;
  joined_date?: string;
}

export interface Listing {
  id: string;
  user_id: string;
  user?: UserProfile;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  listing_type: ListingType;
  
  // Enhanced Structured Fields
  brand?: string;
  model_name?: string;
  product_age?: string;
  purchase_date?: string;
  original_mrp?: number;
  accessories_included?: string;
  warranty_status?: string;
  invoice_available?: boolean;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  terms_version?: string;

  // Wear & Tear / Defects disclosure
  // undefined / empty array = seller did not answer (NOT the same as "No visible damage")
  defects?: DefectType[];
  defect_other?: string;
  defect_description?: string;

  // What's Included
  included_items?: string[];
  included_custom?: string;
  missing_accessories?: string;

  // Packaging & documentation (undefined = not specified)
  packaging_available?: boolean;
  warranty_valid?: boolean;
  documentation_notes?: string;

  // Genuine photos of scratches/defects, shown in a separate "Condition Photos" gallery
  condition_images?: string[];

  // Rent
  rental_price?: number;
  rental_duration?: 'Hourly' | 'Daily' | 'Weekly';
  availability_status?: 'available' | 'booked' | 'unavailable';
  
  // Trade
  estimated_value?: number;
  trade_desired?: string;
  trade_cash_adjustment?: number; // e.g. +500 means requester adds 500, -500 means requester requests 500
  
  // Purchase
  purchase_price?: number;
  
  images: string[];
  location: string;
  status: 'active' | 'pending' | 'completed' | 'inactive';
  featured?: boolean;
  view_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface RentalRequest {
  id: string;
  listing_id: string;
  listing?: Listing;
  renter_id: string;
  renter?: UserProfile;
  owner_id: string;
  start_date: string;
  end_date: string;
  duration_type: 'Hourly' | 'Daily' | 'Weekly';
  duration_units: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  terms_version?: string;
  created_at: string;
}

export interface TradeOffer {
  id: string;
  listing_id: string;
  listing?: Listing;
  requester_id: string;
  requester?: UserProfile;
  owner_id: string;
  offered_item_title: string;
  offered_item_description: string;
  offered_item_image?: string;
  offered_item_value: number;
  cash_adjustment: number; // positive = requester gives extra cash, negative = requester asks cash
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  negotiation_notes?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  created_at: string;
}

export interface PurchaseTransaction {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: UserProfile;
  seller_id: string;
  seller?: UserProfile;
  amount: number;
  status: 'payment_submitted' | 'pending' | 'completed' | 'refunded' | 'cancelled';
  payment_method: string;
  payment_reference?: string;
  payment_confirmed_by_buyer?: boolean;
  payment_confirmed_at?: string;
  payment_verification_status?: 'Awaiting Payment' | 'Payment Submitted' | 'Verified' | 'Cancelled';
  receipt_number: string;
  shipping_address: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: UserProfile;
  content: string;
  message_type: 'text' | 'rental_offer' | 'trade_offer' | 'system';
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  listing?: Listing;
  participant1_id: string;
  participant1?: UserProfile;
  participant2_id: string;
  participant2?: UserProfile;
  subject?: string;
  last_message_text?: string;
  last_message_at: string;
  unread_count?: number;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer?: UserProfile;
  target_user_id: string;
  listing_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CommunityRequest {
  id: string;
  user_id: string;
  user?: UserProfile;
  item_name: string;
  category?: ListingCategory;
  listing_type?: ListingType;
  details?: string;
  created_at: string;
}
