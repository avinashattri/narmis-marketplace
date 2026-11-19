import React from 'react';
import { ExplorePage } from './ExplorePage';
import { CricketPurchaseIllustration } from '../components/illustrations/CartoonCharacters';
import { ShoppingBag, CreditCard, ShieldCheck, Tag } from 'lucide-react';

export const PurchasePage: React.FC = () => {
  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-200 border border-emerald-600/40">
                <ShoppingBag className="w-3.5 h-3.5" />
                Direct Purchase Store
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-narmis-parchment">
                Buy Verified Pre-Loved Treasures
              </h1>
              <p className="text-sm sm:text-base text-narmis-cream/80 leading-relaxed">
                Give timeless gear, headphones, ergonomic chairs, cricket bats, and consoles a permanent
                home. Secure demo transactions and direct seller coordinate pick-up.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-narmis-cream/70">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-narmis-gold" />
                  <span>Fair Community INR Pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-narmis-gold" />
                  <span>Demo Checkout Simulation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold" />
                  <span>Graded Condition Guarantee</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden md:block">
              <CricketPurchaseIllustration className="w-48 h-48 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      <ExplorePage
        initialType="purchase"
        titleOverride="Items Available for Direct Purchase"
        subtitleOverride="Explore quality tested items ready for immediate ownership."
      />
    </div>
  );
};
