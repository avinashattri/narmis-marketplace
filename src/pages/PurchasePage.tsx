import React from 'react';
import { Link } from 'react-router-dom';
import { ExplorePage } from './ExplorePage';
import { CricketPurchaseIllustration } from '../components/illustrations/CartoonCharacters';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const PurchasePage: React.FC = () => {
  const { cartCount, cartSubtotal } = useMarketplace();

  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                home. Add multiple items to your persistent cart or buy directly via UPI QR.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-narmis-cream/70">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-narmis-gold" />
                  <span>Fair Community INR Pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-narmis-gold" />
                  <span>Direct UPI QR Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold" />
                  <span>Cross-Device Shopping Cart</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden md:block">
              <CricketPurchaseIllustration className="w-48 h-48 drop-shadow-xl" />
            </div>
          </div>

          {/* Persistent Shopping Cart Bar */}
          <div className="p-4 rounded-2xl bg-narmis-surface/90 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-sm sm:text-base font-bold text-narmis-parchment">
                  {cartCount > 0
                    ? `${cartCount} Item${cartCount === 1 ? '' : 's'} in Your Purchase Cart · Subtotal: ₹${cartSubtotal.toLocaleString('en-IN')}`
                    : 'Your Persistent Purchase Cart'}
                </h2>
                <p className="text-xs text-narmis-cream/70">
                  {cartCount > 0
                    ? 'Ready to check out all cart items together or adjust quantities.'
                    : 'Click the cart button on any sale listing card or product page to add items to your cart.'}
                </p>
              </div>
            </div>

            <Link
              to="/cart"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shrink-0 inline-flex items-center gap-1.5"
            >
              <span>View Cart & Checkout ({cartCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
