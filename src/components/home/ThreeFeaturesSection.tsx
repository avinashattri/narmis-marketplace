import React from 'react';
import { Link } from 'react-router-dom';
import {
  LaptopRentalIllustration,
  KeyboardTradeIllustration,
  CricketPurchaseIllustration,
} from '../illustrations/CartoonCharacters';
import { Calendar, Repeat, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ThreeFeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-narmis-bg relative overflow-hidden">
      {/* Subtle background ornamentation */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-narmis-surface rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-narmis-mountain rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            Core Marketplace Pillars
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-narmis-parchment">
            One Platform. Three Lifecycles.
          </h2>
          <p className="font-serif italic text-lg text-narmis-cream/80 mt-2">
            RENT. TRADE. PURCHASE.
          </p>
          <p className="text-sm sm:text-base text-narmis-cream/70 mt-3 max-w-xl mx-auto">
            Traditional commerce assumes products have a single owner. NARMIS re-imagines every
            camera, keyboard, tool, and racket as shared community resources.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FEATURE A: RENT */}
          <div className="bg-narmis-surface/90 rounded-3xl p-8 border border-narmis-mountain/60 hover:border-narmis-gold/60 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-950/80 text-sky-200 border border-sky-600/40">
                  <Calendar className="w-3.5 h-3.5" />
                  Feature A · Rent
                </span>
                <span className="text-xs font-semibold text-narmis-cream/60">Hourly / Daily / Weekly</span>
              </div>

              {/* Character Illustration */}
              <div className="flex justify-center my-4">
                <LaptopRentalIllustration className="w-44 h-44 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-2">
                Rent What You Need
              </h3>
              <p className="text-sm text-narmis-cream/75 leading-relaxed mb-6">
                Need high-end gear for a weekend project or hackathon? Rent cameras, laptops, sports equipment,
                and tools directly from verified peers without the burden of full ownership.
              </p>

              <ul className="space-y-2.5 text-xs text-narmis-cream/80 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Flexible duration: Hourly, Daily, or Weekly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Direct chat negotiation with gear owners</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Transparent deposit & availability calendar</span>
                </li>
              </ul>
            </div>

            <Link
              to="/rent"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-narmis-mountain/80 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment transition-all border border-narmis-mountain"
            >
              <span>Explore Rentals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FEATURE B: TRADE (Highlight) */}
          <div className="bg-gradient-to-b from-narmis-surface via-[#203732] to-narmis-surface rounded-3xl p-8 border-2 border-narmis-gold/70 shadow-2xl flex flex-col justify-between group hover:-translate-y-1 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-narmis-gold text-narmis-charcoal font-bold text-[11px] uppercase tracking-wider shadow-md">
              Flagship Exchange Engine
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-200 border border-amber-600/40">
                  <Repeat className="w-3.5 h-3.5" />
                  Feature B · Trade
                </span>
                <span className="text-xs font-semibold text-narmis-gold">Cash Adjustments Supported</span>
              </div>

              {/* Character Illustration */}
              <div className="flex justify-center my-4">
                <KeyboardTradeIllustration className="w-44 h-44 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-2">
                Trade Items with Confidence
              </h3>
              <p className="text-sm text-narmis-cream/75 leading-relaxed mb-6">
                Exchange things you no longer use for things you desire. Have a ₹2,000 keyboard and want a
                ₹1,500 mouse? Propose a trade with a ₹500 cash adjustment to balance the scale!
              </p>

              <ul className="space-y-2.5 text-xs text-narmis-cream/80 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Automated value difference & cash offset calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Dual mutual approval requirement before agreement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Integrated real-time negotiation chat</span>
                </li>
              </ul>
            </div>

            <Link
              to="/trade"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal transition-all shadow-md"
            >
              <span>Explore Trade Offers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FEATURE C: PURCHASE */}
          <div className="bg-narmis-surface/90 rounded-3xl p-8 border border-narmis-mountain/60 hover:border-narmis-gold/60 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-200 border border-emerald-600/40">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Feature C · Purchase
                </span>
                <span className="text-xs font-semibold text-narmis-cream/60">Demo Checkout Ready</span>
              </div>

              {/* Character Illustration */}
              <div className="flex justify-center my-4">
                <CricketPurchaseIllustration className="w-44 h-44 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-2">
                Purchase Pre-Loved Goods
              </h3>
              <p className="text-sm text-narmis-cream/75 leading-relaxed mb-6">
                When you want to keep something permanently, purchase certified condition pre-loved items
                from trusted community sellers with immediate demo checkout and receipts.
              </p>

              <ul className="space-y-2.5 text-xs text-narmis-cream/80 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Fair INR pricing with verified seller profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Item condition grading (Brand New to Fair)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                  <span>Simulated hackathon payment & instant receipts</span>
                </li>
              </ul>
            </div>

            <Link
              to="/purchase"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-narmis-mountain/80 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment transition-all border border-narmis-mountain"
            >
              <span>Explore Purchase Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
