import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/marketplace/ProductCard';
import { EmptyStateIllustration } from '../components/illustrations/CartoonCharacters';
import { ListingCategory, ListingCondition, ListingType } from '../types';
import {
  Search,
  SlidersHorizontal,
  X,
  Calendar,
  Repeat,
  ShoppingBag,
  Sparkles,
  ArrowUpDown,
  Megaphone,
  Send,
  CheckCircle2,
  Users,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES: ListingCategory[] = [
  'Electronics',
  'Computers and Accessories',
  'Books',
  'Tools and Equipment',
  'Photography',
  'Gaming',
  'Sports Equipment',
  'Cricket Equipment',
  'Fashion & Apparel',
  'Furniture',
  'Other',
];

const CONDITIONS: ListingCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Needs Repair',
];

interface ExplorePageProps {
  initialType?: ListingType;
  titleOverride?: string;
  subtitleOverride?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialType,
  titleOverride,
  subtitleOverride,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, communityRequests, addCommunityRequest } = useMarketplace();

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>(
    initialType || (searchParams.get('type') as ListingType) || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'all'>(
    (searchParams.get('category') as ListingCategory) || 'all'
  );
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Community Request Notice & Form state
  const [requestItemName, setRequestItemName] = useState(searchTerm || '');
  const [requestCategory, setRequestCategory] = useState<ListingCategory>('Electronics');
  const [requestType, setRequestType] = useState<ListingType>('rent');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setRequestItemName(searchTerm);
    }
  }, [searchTerm]);

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestItemName.trim()) return;

    setIsSubmittingRequest(true);
    try {
      await addCommunityRequest({
        item_name: requestItemName.trim(),
        category: requestCategory,
        listing_type: requestType,
        details: requestDetails.trim() || undefined,
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setRequestDetails('');
      }, 300);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Sync state if initialType changes (e.g. navigation between /rent, /trade, /purchase)
  React.useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => item.status === 'active')
      .filter((item) => {
        // Type filter
        if (selectedType !== 'all' && item.listing_type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Condition filter
        if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;

        // Price check
        const effectivePrice =
          item.listing_type === 'rent'
            ? item.rental_price || 0
            : item.listing_type === 'trade'
            ? item.estimated_value || 0
            : item.purchase_price || 0;

        if (effectivePrice > maxPrice) return false;

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'popular') {
          return (b.view_count || 0) - (a.view_count || 0);
        }

        const priceA = a.rental_price || a.estimated_value || a.purchase_price || 0;
        const priceB = b.rental_price || b.estimated_value || b.purchase_price || 0;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        return 0;
      });
  }, [listings, selectedType, selectedCategory, selectedCondition, searchTerm, sortBy, maxPrice]);

  const clearAllFilters = () => {
    setSearchTerm('');
    if (!initialType) setSelectedType('all');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setMaxPrice(50000);
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    (!initialType && selectedType !== 'all') ||
    selectedCategory !== 'all' ||
    selectedCondition !== 'all' ||
    maxPrice < 50000;

  return (
    <div className="pt-24 pb-20 bg-narmis-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner / Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NARMIS Marketplace</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-narmis-parchment">
            {titleOverride || 'Explore All Marketplace Listings'}
          </h1>
          <p className="text-sm sm:text-base text-narmis-cream/70 mt-2 max-w-2xl">
            {subtitleOverride ||
              'Discover peer-owned laptops, cameras, sports gear, books, and musical instruments. Rent, trade, or purchase directly.'}
          </p>
        </div>

        {/* Search & Main Controls Bar */}
        <div className="bg-narmis-surface rounded-2xl p-4 border border-narmis-mountain/60 shadow-xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search camera, keyboard, cricket bat, books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark/80 border border-narmis-mountain/50 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-narmis-cream/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Model Type Filters Pills (Only shown if not locked to rent/trade/purchase) */}
          {!initialType && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-narmis-forestDark/70 border border-narmis-mountain/40 overflow-x-auto max-w-full">
              {(['all', 'rent', 'trade', 'purchase'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                      : 'text-narmis-cream/70 hover:text-narmis-parchment hover:bg-narmis-surface'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          )}

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-narmis-forestDark/80 px-3 py-2 rounded-xl border border-narmis-mountain/50 text-xs text-narmis-cream">
              <ArrowUpDown className="w-3.5 h-3.5 text-narmis-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs text-narmis-cream focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-narmis-surface text-narmis-cream">Newest First</option>
                <option value="popular" className="bg-narmis-surface text-narmis-cream">Most Popular</option>
                <option value="price_asc" className="bg-narmis-surface text-narmis-cream">Price: Low to High</option>
                <option value="price_desc" className="bg-narmis-surface text-narmis-cream">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-narmis-forestDark/80 border border-narmis-mountain/50 text-xs font-medium text-narmis-parchment"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-narmis-gold" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters Desktop */}
          <aside
            className={`lg:block ${
              isMobileFilterOpen
                ? 'fixed inset-0 z-50 bg-narmis-bg/95 p-6 overflow-y-auto'
                : 'hidden'
            } lg:relative lg:p-0 lg:bg-transparent`}
          >
            <div className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/60 space-y-6 sticky top-24 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-narmis-mountain/40">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-narmis-gold" />
                  <h3 className="font-serif text-base font-bold text-narmis-parchment">Filters</h3>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-narmis-terracotta hover:underline font-semibold"
                  >
                    Reset All
                  </button>
                )}

                {isMobileFilterOpen && (
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="lg:hidden text-narmis-cream"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-2.5">
                  Category (10 Categories)
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-narmis-mountain text-narmis-parchment font-bold'
                        : 'text-narmis-cream/70 hover:bg-narmis-mountain/30'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] opacity-60">{listings.length}</span>
                  </button>

                  {CATEGORIES.map((cat) => {
                    const count = listings.filter((l) => l.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          selectedCategory === cat
                            ? 'bg-narmis-mountain text-narmis-parchment font-bold'
                            : 'text-narmis-cream/70 hover:bg-narmis-mountain/30'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span className="text-[10px] opacity-60 shrink-0">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="pt-3 border-t border-narmis-mountain/40">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-2.5">
                  Item Condition
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCondition('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedCondition === 'all'
                        ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                        : 'bg-narmis-forestDark/60 text-narmis-cream/70 hover:bg-narmis-mountain/50'
                    }`}
                  >
                    Any
                  </button>
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setSelectedCondition(cond)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        selectedCondition === cond
                          ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                          : 'bg-narmis-forestDark/60 text-narmis-cream/70 hover:bg-narmis-mountain/50'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max Filter */}
              <div className="pt-3 border-t border-narmis-mountain/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                    Max Value / Price
                  </h4>
                  <span className="text-xs font-mono font-bold text-narmis-gold">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-narmis-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-narmis-cream/50 mt-1">
                  <span>₹500</span>
                  <span>₹25,000</span>
                  <span>₹50,000</span>
                </div>
              </div>

              {isMobileFilterOpen && (
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-narmis-gold text-narmis-charcoal font-bold text-xs uppercase tracking-wider"
                >
                  Apply Filters ({filteredListings.length} Results)
                </button>
              )}
            </div>
          </aside>

          {/* Listings Product Grid */}
          <main className="lg:col-span-3">
            {/* Results count & active tags */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-narmis-cream/70">
                Showing <span className="font-bold text-narmis-parchment">{filteredListings.length}</span> items
                {selectedCategory !== 'all' && <span> in {selectedCategory}</span>}
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-narmis-gold hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {filteredListings.length === 0 ? (
              <div className="space-y-8 animate-fadeIn">
                {/* Zero State Hero Box */}
                <div className="bg-narmis-surface rounded-3xl p-8 sm:p-10 border border-narmis-mountain/60 text-center shadow-xl flex flex-col items-center justify-center">
                  <EmptyStateIllustration className="w-36 h-36 mb-2" />
                  <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
                    {searchTerm ? `No listings found for "${searchTerm}"` : 'No listings found'}
                  </h3>
                  <p className="text-xs sm:text-sm text-narmis-cream/70 max-w-md mt-1 mb-4">
                    {searchTerm
                      ? `We couldn't find "${searchTerm}" in the current catalog, but someone in the community might have it sitting on their shelf!`
                      : 'We could not find any items matching your selected criteria.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-parchment text-xs font-semibold uppercase tracking-wider transition-all border border-narmis-mountain/80"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Community Request Notice & Interactive Form */}
                <div className="bg-gradient-to-br from-narmis-surface to-narmis-forestDark rounded-3xl p-6 sm:p-8 border-2 border-narmis-gold/60 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-narmis-gold/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-start sm:items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-2xl bg-narmis-gold/20 text-narmis-gold border border-narmis-gold/40 shrink-0">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-narmis-gold block">
                        Community Wishlist Notice
                      </span>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-narmis-parchment">
                        Ask the Community for This Item!
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-narmis-cream/80 mb-6 leading-relaxed max-w-xl">
                    Can't find what you need? Post a community request below. Members in your area will be
                    notified and can list their item for you to rent, trade, or purchase.
                  </p>

                  {requestSuccess ? (
                    <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-3 animate-fadeIn">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h5 className="font-serif text-lg font-bold text-emerald-200">
                        Community Request Published!
                      </h5>
                      <p className="text-xs text-emerald-100/80 max-w-md mx-auto">
                        Your request for <strong>"{requestItemName}"</strong> is now live on the NARMIS
                        Community Board. Other members can see it and offer their gear.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestSuccess(false);
                          setRequestItemName('');
                        }}
                        className="mt-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
                      >
                        Ask For Another Item
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePostRequest} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                            Item You Are Looking For *
                          </label>
                          <input
                            type="text"
                            required
                            value={requestItemName}
                            onChange={(e) => setRequestItemName(e.target.value)}
                            placeholder="e.g. Sony A7 III camera, Keychron keyboard, Raspberry Pi 4..."
                            className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/70 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                            Desired Model
                          </label>
                          <select
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value as ListingType)}
                            className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/70 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                          >
                            <option value="rent">Rent (Temporary)</option>
                            <option value="trade">Trade (Exchange)</option>
                            <option value="purchase">Purchase (Buy)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                            Category
                          </label>
                          <select
                            value={requestCategory}
                            onChange={(e) => setRequestCategory(e.target.value as ListingCategory)}
                            className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/70 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                            Details & Budget / Duration Notes
                          </label>
                          <input
                            type="text"
                            value={requestDetails}
                            onChange={(e) => setRequestDetails(e.target.value)}
                            placeholder="e.g. Needed for 2 days this weekend in Koramangala. Budget ~₹1,000"
                            className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/70 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-narmis-cream/60 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-narmis-gold" />
                          <span>Visible to campus & local community members</span>
                        </span>

                        <button
                          type="submit"
                          disabled={isSubmittingRequest || !requestItemName.trim()}
                          className="px-6 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingRequest ? 'Posting...' : 'Post Community Request'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ProductCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Always-accessible Quick Community Request Banner */}
                <div className="bg-narmis-surface/80 rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-narmis-gold/20 text-narmis-gold">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-narmis-parchment">
                        Looking for something not listed above?
                      </h4>
                      <p className="text-[11px] text-narmis-cream/60">
                        Ask fellow members — someone might have it and be willing to rent or trade.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const askPrompt = prompt('What item are you looking for from the community?');
                      if (askPrompt && askPrompt.trim()) {
                        addCommunityRequest({
                          item_name: askPrompt.trim(),
                          category: 'Other',
                          listing_type: 'rent',
                          details: 'Broadcast from explore page wishlist request',
                        });
                        alert(`Your request for "${askPrompt}" has been posted to the community!`);
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-bold uppercase tracking-wider shrink-0 border border-narmis-gold/30"
                  >
                    Ask the Community
                  </button>
                </div>
              </div>
            )}

            {/* Community Requests / Wishlist Board */}
            {communityRequests.length > 0 && (
              <div className="mt-16 pt-10 border-t border-narmis-mountain/50 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-narmis-surface text-narmis-gold border border-narmis-gold/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-narmis-parchment">
                        Community Wishlist & Requests
                      </h3>
                      <p className="text-xs text-narmis-cream/60">
                        Items members are searching for. If you have any of these, fulfill a request and earn!
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-narmis-surface text-narmis-gold border border-narmis-gold/30 text-xs font-bold">
                    {communityRequests.length} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-narmis-surface rounded-2xl p-4 border border-narmis-mountain/60 hover:border-narmis-gold/50 transition-all flex flex-col justify-between shadow-md"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={req.user?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=304943&color=EAD3AA'}
                              alt={req.user?.full_name || 'Member'}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-narmis-gold/50"
                            />
                            <span className="text-xs font-bold text-narmis-parchment">
                              {req.user?.full_name || 'Community Member'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.listing_type === 'rent'
                                ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                                : req.listing_type === 'trade'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {req.listing_type || 'rent'}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-narmis-parchment text-sm">
                          {req.item_name}
                        </h4>

                        {req.category && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-narmis-forestDark text-narmis-cream/70 border border-narmis-mountain/50">
                            {req.category}
                          </span>
                        )}

                        {req.details && (
                          <p className="text-xs text-narmis-cream/75 line-clamp-2 leading-relaxed">
                            "{req.details}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-narmis-mountain/40 flex items-center justify-between">
                        <span className="text-[10px] text-narmis-cream/50">
                          {new Date(req.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        <button
                          onClick={() => {
                            navigate(
                              `/create-listing?title=${encodeURIComponent(req.item_name)}&type=${req.listing_type || 'rent'}`
                            );
                          }}
                          className="px-3 py-1 rounded-full bg-narmis-gold/20 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-gold border border-narmis-gold/40 text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>I Have This!</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
