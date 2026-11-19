import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
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
  'Furniture',
  'Other',
];

const CONDITIONS: ListingCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
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
  const { listings } = useMarketplace();

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
              <div className="bg-narmis-surface rounded-3xl p-12 text-center border border-narmis-mountain/40 flex flex-col items-center justify-center space-y-4">
                <EmptyStateIllustration className="w-48 h-48" />
                <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
                  No listings found
                </h3>
                <p className="text-xs sm:text-sm text-narmis-cream/70 max-w-sm">
                  We could not find any items matching your current filters. Try resetting filters or
                  searching with different keywords!
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ProductCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
