import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../marketplace/ProductCard';
import { ListingType } from '../../types';
import { ArrowRight, Flame } from 'lucide-react';

export const FeaturedListingsSection: React.FC = () => {
  const { listings } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'all' | ListingType>('all');

  const filteredListings = listings
    .filter((item) => item.status === 'active')
    .filter((item) => (activeTab === 'all' ? true : item.listing_type === activeTab))
    .slice(0, 6);

  return (
    <section className="py-24 bg-narmis-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Trending in Bengaluru</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
              Recently Listed & Featured
            </h2>
            <p className="text-sm text-narmis-cream/70 mt-2">
              Explore authentic gear, accessories, instruments, and books ready for exchange.
            </p>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-narmis-surface border border-narmis-mountain/60 self-start md:self-auto overflow-x-auto max-w-full">
            {(['all', 'rent', 'trade', 'purchase'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-narmis-gold text-narmis-charcoal shadow-md'
                    : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
                }`}
              >
                {tab === 'all' ? 'All Items' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-narmis-surface hover:bg-narmis-mountain text-narmis-parchment border border-narmis-gold/50 hover:border-narmis-gold transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <span>View All {listings.length} Marketplace Listings</span>
            <ArrowRight className="w-4 h-4 text-narmis-gold" />
          </Link>
        </div>
      </div>
    </section>
  );
};
