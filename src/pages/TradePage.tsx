import React from 'react';
import { ExplorePage } from './ExplorePage';
import { KeyboardTradeIllustration } from '../components/illustrations/CartoonCharacters';
import { Repeat, ArrowLeftRight, Coins, ShieldCheck } from 'lucide-react';

export const TradePage: React.FC = () => {
  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-200 border border-amber-600/40">
                <Repeat className="w-3.5 h-3.5" />
                NARMIS Trade Engine
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-narmis-parchment">
                Exchange Items, Balance with Cash
              </h1>
              <p className="text-sm sm:text-base text-narmis-cream/80 leading-relaxed">
                The most sustainable way to upgrade your gear. Propose a trade with another member,
                automatically compute estimated valuation differences, and balance it with optional cash.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-narmis-cream/70">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-narmis-gold" />
                  <span>Item-for-Item Barter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-narmis-gold" />
                  <span>Flexible Cash Offsets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold" />
                  <span>Mutual Explicit Approvals</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden md:block">
              <KeyboardTradeIllustration className="w-52 h-48 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      <ExplorePage
        initialType="trade"
        titleOverride="Active Trade & Barter Offers"
        subtitleOverride="Explore items community members are eager to exchange."
      />
    </div>
  );
};
