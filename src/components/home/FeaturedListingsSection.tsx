import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../marketplace/ProductCard';
import { ScrollReveal } from '../common/MotionPrimitives';
import { ListingType } from '../../types';
import { ArrowRight, Flame, Loader2, PlusCircle } from 'lucide-react';

const TABS: Array<{ id: 'all' | ListingType; label: string }> = [
  { id: 'all', label: 'All Items' },
  { id: 'rent', label: 'Rent' },
  { id: 'trade', label: 'Trade' },
  { id: 'purchase', label: 'Purchase' },
];

export const FeaturedListingsSection: React.FC = () => {
  const { listings, isLoadingListings } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'all' | ListingType>('all');

  const filteredListings = listings
    .filter((item) => item.status === 'active')
    .filter((item) => (activeTab === 'all' ? true : item.listing_type === activeTab))
    .slice(0, 6);

  return (
    <section className="py-24 bg-narmis-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-narmis-surface border border-narmis-gold/35 text-xs font-semibold uppercase tracking-widest text-narmis-gold mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Curated Community Picks</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
              Recently Listed &amp; Featured
            </h2>
            <p className="text-sm text-narmis-cream/70 mt-2">
              Explore authentic gear, accessories, instruments, and books ready for exchange.
            </p>
          </div>

          {/* Animated Type Filter Pills */}
          <div
            role="tablist"
            aria-label="Filter featured listings"
            className="flex items-center gap-1.5 p-1.5 rounded-full bg-narmis-surface border border-narmis-mountain/60 self-start md:self-auto overflow-x-auto max-w-full shadow-lg"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-narmis-charcoal'
                      : 'text-narmis-cream/80 hover:text-narmis-parchment'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="featured-listings-tab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-narmis-gold shadow-md"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Listings Grid with Smooth Category Transitions */}
        {isLoadingListings && filteredListings.length === 0 ? (
          <div className="bg-narmis-surface rounded-3xl p-12 border border-narmis-mountain/60 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-narmis-gold animate-spin mx-auto" />
            <p className="text-sm text-narmis-cream/75">Loading live marketplace listings...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredListings.length === 0 ? (
              <motion.div
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="bg-narmis-surface rounded-3xl p-12 border border-narmis-mountain/60 text-center space-y-4"
              >
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  No active listings in this category yet
                </h3>
                <p className="text-xs sm:text-sm text-narmis-cream/70 max-w-md mx-auto">
                  Be the first to share an item to rent, trade, or purchase with the community.
                </p>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block"
                >
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create a Listing</span>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${activeTab}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {filteredListings.map((listing, idx) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ProductCard listing={listing} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Bottom CTA */}
        <ScrollReveal delay={0.1} yOffset={16} className="mt-14 text-center">
          <motion.div
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="inline-block"
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-narmis-surface hover:bg-narmis-mountain text-narmis-parchment border border-narmis-gold/50 hover:border-narmis-gold transition-colors shadow-lg group"
            >
              <span>View All {listings.length} Marketplace Listings</span>
              <ArrowRight className="w-4 h-4 text-narmis-gold transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};
