import React from 'react';
import { Link } from 'react-router-dom';
import { ExplorePage } from './ExplorePage';
import { KeyboardTradeIllustration } from '../components/illustrations/CartoonCharacters';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import {
  Repeat,
  ArrowLeftRight,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Clock,
  Crown,
  Loader2,
} from 'lucide-react';

export const TradePage: React.FC = () => {
  const { tradeAccess, isLoadingTradeAccess, subscriptionPayments } = useMarketplace();
  const { isAuthenticated } = useAuth();

  const expiryText = tradeAccess.subscription_expires_at
    ? new Date(tradeAccess.subscription_expires_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const hasPendingVerification =
    isAuthenticated &&
    !tradeAccess.subscription_active &&
    subscriptionPayments.some((p) => p.verification_status === 'Pending Verification');

  const getDynamicStatus = (): {
    label: string;
    detail: string;
    tone: 'active' | 'available' | 'exhausted' | 'guest' | 'loading';
  } => {
    if (!isAuthenticated) {
      return {
        label: '3 free offers for every member',
        detail: 'Sign in to check your live remaining trade offers or activate the annual Trade Pass.',
        tone: 'guest',
      };
    }

    if (isLoadingTradeAccess) {
      return {
        label: 'Checking your Trade Pass status...',
        detail: 'Loading your real trade offer balance from your NARMIS account.',
        tone: 'loading',
      };
    }

    if (tradeAccess.subscription_active) {
      return {
        label: expiryText ? `Trade Pass Active — Expires ${expiryText}` : 'Trade Pass Active',
        detail: 'Unlimited peer-to-peer trade offers unlocked across all your devices.',
        tone: 'active',
      };
    }

    const remaining = Math.max(0, tradeAccess.free_trials_remaining);
    if (remaining >= 3) {
      return {
        label: '3 free offers remaining',
        detail: 'Start proposing peer-to-peer trades right away — no payment needed for your first 3 offers.',
        tone: 'available',
      };
    }
    if (remaining === 2) {
      return {
        label: '2 free offers remaining',
        detail: 'You have used 1 of your 3 free trade offers. Upgrade anytime for ₹299/year.',
        tone: 'available',
      };
    }
    if (remaining === 1) {
      return {
        label: '1 free offer remaining',
        detail: 'You have 1 free trade offer left before the annual Trade Pass is required.',
        tone: 'available',
      };
    }

    return {
      label: 'Free offers exhausted — Upgrade to Trade Pass',
      detail: 'Activate the ₹299/year NARMIS Trade Pass via UPI QR to continue proposing trades.',
      tone: 'exhausted',
    };
  };

  const statusInfo = getDynamicStatus();

  const statusBadgeClasses =
    statusInfo.tone === 'active'
      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50'
      : statusInfo.tone === 'exhausted'
      ? 'bg-amber-950/90 text-amber-200 border-amber-500/60'
      : statusInfo.tone === 'available'
      ? 'bg-narmis-forestDark/90 text-narmis-gold border-narmis-gold/45'
      : 'bg-narmis-forestDark/80 text-narmis-cream/85 border-narmis-mountain/60';

  const tradePassHighlights = [
    '3 FREE trade offers for every user.',
    'After using all 3 free offers, an annual subscription is required.',
    'Annual price: ₹299/year.',
    'No recurring automatic charges.',
    'Payment through the existing NARMIS UPI QR code.',
    'Manual payment verification by an administrator.',
  ];

  return (
    <div>
      {/* Top Trade Header & Subscription Section */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-24 sm:pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* NARMIS TRADE PASS — Placed at the very top immediately below navigation */}
          <section
            aria-label="NARMIS Trade Pass Subscription Model"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-narmis-surface via-narmis-forestDark/95 to-narmis-surface border border-narmis-gold/45 shadow-2xl p-5 sm:p-7"
          >
            {/* Subtle antique-gold ambient accent */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-narmis-gold/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Title, Dynamic Status & Benefits */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-gold/15 border border-narmis-gold/45 text-narmis-gold text-[11px] font-bold uppercase tracking-widest">
                    <Crown className="w-3.5 h-3.5" />
                    NARMIS TRADE PASS
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusBadgeClasses}`}
                  >
                    {statusInfo.tone === 'loading' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : statusInfo.tone === 'active' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-narmis-gold" />
                    )}
                    <span>{statusInfo.label}</span>
                  </span>

                  {hasPendingVerification && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/45 text-amber-200 text-[11px] font-semibold">
                      <Clock className="w-3 h-3" />
                      UPI Payment Pending Verification
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-narmis-parchment tracking-tight">
                    NARMIS TRADE PASS
                  </h2>
                  <p className="text-xs sm:text-sm text-narmis-cream/75 mt-1">
                    {statusInfo.detail}
                  </p>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {tradePassHighlights.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-xs sm:text-[13px] text-narmis-cream/90 leading-snug"
                    >
                      <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Prominent Price & CTA Card */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl bg-narmis-forestDark/90 border border-narmis-gold/40 p-5 flex flex-col justify-between gap-4 shadow-inner">
                  <div className="space-y-1.5 text-center lg:text-left">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-narmis-gold/90">
                      <QrCode className="w-3.5 h-3.5" />
                      Annual Trade Access
                    </span>
                    <div className="flex items-baseline justify-center lg:justify-start gap-1">
                      <span className="font-serif text-3xl sm:text-4xl font-black text-narmis-gold">
                        ₹299
                      </span>
                      <span className="text-sm font-semibold text-narmis-parchment/85">/year</span>
                    </div>
                    <p className="text-[11px] text-narmis-cream/70">
                      One-time UPI QR payment · No automatic renewals · Verified by admin
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/subscription"
                      className="w-full py-3 px-5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg transition-all inline-flex items-center justify-center gap-2"
                    >
                      <span>
                        {isAuthenticated && tradeAccess.subscription_active
                          ? 'Manage Trade Pass'
                          : 'Get Trade Pass'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {!isAuthenticated && (
                      <Link
                        to="/login"
                        className="w-full py-2 px-4 rounded-full bg-narmis-mountain/40 hover:bg-narmis-mountain/60 border border-narmis-mountain/60 text-narmis-parchment text-[11px] font-semibold transition-colors inline-flex items-center justify-center"
                      >
                        Sign in to check your 3 free offers
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Trade Intro Banner */}
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
                  <span>3 Free Offers · ₹299/yr Pass</span>
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
