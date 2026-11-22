import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LaptopRentalIllustration,
  KeyboardTradeIllustration,
  CricketPurchaseIllustration,
} from '../illustrations/CartoonCharacters';
import { ScrollReveal, TiltCard } from '../common/MotionPrimitives';
import { Calendar, Repeat, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

type PillarKey = 'rent' | 'trade' | 'purchase';

const PILLAR_CONFIG: Array<{
  key: PillarKey;
  tabLabel: string;
  badgeText: string;
  subTag: string;
  title: string;
  description: string;
  bullets: string[];
  ctaText: string;
  to: string;
  featured?: boolean;
  badgeStyle: string;
  icon: React.ComponentType<{ className?: string }>;
  illustration: React.ReactNode;
}> = [
  {
    key: 'rent',
    tabLabel: 'Rent',
    badgeText: 'Feature A · Rent',
    subTag: 'Hourly / Daily / Weekly',
    title: 'Rent What You Need',
    description:
      'Need high-end gear for a weekend project or hackathon? Rent cameras, laptops, sports equipment, and tools directly from verified peers without the burden of full ownership.',
    bullets: [
      'Flexible duration: Hourly, Daily, or Weekly',
      'Direct chat negotiation with gear owners',
      'Transparent deposit & availability calendar',
    ],
    ctaText: 'Explore Rentals',
    to: '/rent',
    badgeStyle: 'bg-sky-950/80 text-sky-200 border-sky-600/40',
    icon: Calendar,
    illustration: <LaptopRentalIllustration className="w-44 h-44 drop-shadow-lg" />,
  },
  {
    key: 'trade',
    tabLabel: 'Trade',
    badgeText: 'Feature B · Trade',
    subTag: 'Cash Adjustments Supported',
    title: 'Trade Items with Confidence',
    description:
      'Exchange things you no longer use for things you desire. Have a ₹2,000 keyboard and want a ₹1,500 mouse? Propose a trade with a ₹500 cash adjustment to balance the scale!',
    bullets: [
      'Automated value difference & cash offset calculation',
      'Dual mutual approval requirement before agreement',
      'Integrated real-time negotiation chat',
    ],
    ctaText: 'Explore Trade Offers',
    to: '/trade',
    featured: true,
    badgeStyle: 'bg-amber-950/80 text-amber-200 border-amber-600/40',
    icon: Repeat,
    illustration: <KeyboardTradeIllustration className="w-44 h-44 drop-shadow-lg" />,
  },
  {
    key: 'purchase',
    tabLabel: 'Purchase',
    badgeText: 'Feature C · Purchase',
    subTag: 'Direct UPI QR Ready',
    title: 'Purchase Pre-Loved Goods',
    description:
      'When you want to keep something permanently, purchase inspected pre-loved items from community sellers with direct UPI QR payment and clear order records.',
    bullets: [
      'Fair INR pricing with community seller profiles',
      'Transparent item condition & defect disclosure',
      'Direct UPI QR payment & confirmation tracking',
    ],
    ctaText: 'Explore Purchase Store',
    to: '/purchase',
    badgeStyle: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40',
    icon: ShoppingBag,
    illustration: <CricketPurchaseIllustration className="w-44 h-44 drop-shadow-lg" />,
  },
];

export const ThreeFeaturesSection: React.FC = () => {
  const [focusedPillar, setFocusedPillar] = useState<PillarKey>('trade');

  return (
    <section id="features" className="py-24 bg-narmis-bg relative overflow-hidden">
      {/* Subtle atmospheric wilderness depth glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 w-96 h-96 bg-narmis-surface rounded-full blur-3xl opacity-35 pointer-events-none -translate-y-1/2"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-narmis-mountain rounded-full blur-3xl opacity-20 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-narmis-surface border border-narmis-gold/35 text-xs font-semibold uppercase tracking-widest text-narmis-gold mb-3">
            Core Marketplace Pillars
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-narmis-parchment">
            One Platform. Three Lifecycles.
          </h2>
          <p className="font-serif italic text-lg text-narmis-cream/80 mt-2">
            RENT. TRADE. PURCHASE.
          </p>
          <p className="text-sm sm:text-base text-narmis-cream/70 mt-3 max-w-xl mx-auto leading-relaxed">
            Traditional commerce assumes products have a single owner. NARMIS re-imagines every
            camera, keyboard, tool, and racket as shared community resources.
          </p>

          {/* Interactive Lifecycle Switcher Pill */}
          <div
            role="tablist"
            aria-label="Highlight a NARMIS lifecycle"
            className="inline-flex items-center gap-1.5 p-1.5 mt-7 rounded-full bg-narmis-surface/90 border border-narmis-mountain/70 shadow-lg"
          >
            {PILLAR_CONFIG.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = focusedPillar === pillar.key;
              return (
                <button
                  key={pillar.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setFocusedPillar(pillar.key)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-narmis-charcoal'
                      : 'text-narmis-cream/75 hover:text-narmis-parchment'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="pillar-active-pill"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-narmis-gold shadow-md"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{pillar.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid with Subtle 3D Tilt & Staggered Reveal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PILLAR_CONFIG.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isHighlighted = focusedPillar === pillar.key;

            return (
              <ScrollReveal key={pillar.key} delay={idx * 0.1} yOffset={30} className="h-full">
                <TiltCard
                  maxTilt={4.5}
                  glowColor={
                    isHighlighted
                      ? 'rgba(184, 138, 74, 0.16)'
                      : 'rgba(234, 211, 170, 0.09)'
                  }
                >
                  <div
                    onMouseEnter={() => setFocusedPillar(pillar.key)}
                    className={`h-full rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between group relative ${
                      isHighlighted
                        ? 'bg-gradient-to-b from-narmis-surface via-[#203732] to-narmis-surface border-2 border-narmis-gold/75 shadow-[0_20px_50px_rgba(13,26,24,0.65)]'
                        : 'bg-narmis-surface/90 border border-narmis-mountain/60 hover:border-narmis-gold/50 shadow-xl'
                    }`}
                  >
                    {pillar.featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-narmis-gold text-narmis-charcoal font-bold text-[11px] uppercase tracking-wider shadow-md whitespace-nowrap">
                        Flagship Exchange Engine
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${pillar.badgeStyle}`}
                        >
                          <Icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                          {pillar.badgeText}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isHighlighted ? 'text-narmis-gold' : 'text-narmis-cream/60'
                          }`}
                        >
                          {pillar.subTag}
                        </span>
                      </div>

                      {/* Animated Character Illustration */}
                      <motion.div
                        animate={isHighlighted ? { y: -4, scale: 1.03 } : { y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                        className="flex justify-center my-4"
                      >
                        {pillar.illustration}
                      </motion.div>

                      <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-2 group-hover:text-narmis-gold transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-narmis-cream/75 leading-relaxed mb-6">
                        {pillar.description}
                      </p>

                      <ul className="space-y-2.5 text-xs text-narmis-cream/85 mb-6">
                        {pillar.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                    >
                      <Link
                        to={pillar.to}
                        className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group/btn ${
                          isHighlighted
                            ? 'bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal shadow-lg'
                            : 'bg-narmis-mountain/80 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment border border-narmis-mountain'
                        }`}
                      >
                        <span>{pillar.ctaText}</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </motion.div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
