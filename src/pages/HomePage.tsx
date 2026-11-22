import React from 'react';
import { motion } from 'framer-motion';
import { HeroParallax } from '../components/hero/HeroParallax';
import { ThreeFeaturesSection } from '../components/home/ThreeFeaturesSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FeaturedListingsSection } from '../components/home/FeaturedListingsSection';
import { ScrollReveal, TiltCard } from '../components/common/MotionPrimitives';
import { Star, ShieldCheck, HeartHandshake, Leaf, Users } from 'lucide-react';

const IMPACT_STATS = [
  {
    icon: Leaf,
    value: '100%',
    label: 'Circular Commerce',
  },
  {
    icon: HeartHandshake,
    value: '₹0',
    label: 'Listing Platform Fees',
  },
  {
    icon: ShieldCheck,
    value: 'Verified',
    label: 'Peer Ratings & Reviews',
  },
  {
    icon: Users,
    value: '3 Models',
    label: 'Rent · Trade · Purchase',
  },
];

const TESTIMONIALS = [
  {
    quote:
      '"Rented out my Sony A7 IV camera for a campus documentary for ₹1,200/day. The rental request and confirmation workflow in chat was super smooth!"',
    name: 'Shraddha',
    role: 'Filmmaker & Vocalist, Whitefield',
    avatar:
      'https://ui-avatars.com/api/?name=Shraddha&background=80674D&color=F5E9D2&bold=true&size=150',
    featured: false,
  },
  {
    quote:
      '"Traded my Keychron mechanical keyboard for a Logitech MX Master mouse plus ₹1,200 cash offset. The trade valuation and mutual approval flow worked seamlessly!"',
    name: 'Sanchit',
    role: 'Volleyball Player & Gamer, Indiranagar',
    avatar:
      'https://ui-avatars.com/api/?name=Sanchit&background=B88A4A&color=142523&bold=true&size=150',
    featured: true,
  },
  {
    quote:
      '"Circulated custom 5-inch FPV drone racing gear and flight controllers. Communication in the built-in P2P chat was instant and verified."',
    name: 'Javed Bhaiya',
    role: 'FPV Drone Builder, Frazer Town',
    avatar:
      'https://ui-avatars.com/api/?name=Javed+Bhaiya&background=304943&color=EAD3AA&bold=true&size=150',
    featured: false,
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="w-full bg-narmis-bg">
      {/* 1. Full-Screen Immersive Mountain & Forest Parallax Hero */}
      <HeroParallax />

      {/* Smooth Transitional Trust & Impact Bar */}
      <section
        id="impact"
        className="relative bg-gradient-to-b from-narmis-bg via-narmis-surface/90 to-narmis-surface border-y border-narmis-mountain/50 py-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-narmis-gold/45 to-transparent"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {IMPACT_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <ScrollReveal key={stat.label} delay={idx * 0.08} yOffset={18}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className="flex flex-col items-center group px-3 py-2 rounded-2xl hover:bg-narmis-forestDark/45 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-narmis-gold mb-1.5">
                      <span className="p-1.5 rounded-lg bg-narmis-forestDark/80 border border-narmis-gold/25 group-hover:border-narmis-gold/60 transition-colors">
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                      </span>
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-narmis-cream/70 uppercase tracking-wider font-semibold">
                      {stat.label}
                    </p>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Three Core Marketplace Pillars (Rent · Trade · Purchase) */}
      <ThreeFeaturesSection />

      {/* 3. How NARMIS Works */}
      <HowItWorksSection />

      {/* 4. Live Featured Marketplace Listings */}
      <FeaturedListingsSection />

      {/* 5. Community Testimonials */}
      <section className="py-24 bg-gradient-to-b from-narmis-bg via-narmis-forestDark/90 to-narmis-forestDark border-t border-narmis-mountain/40 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[38rem] h-56 rounded-full bg-narmis-gold/5 blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-[11px] font-semibold uppercase tracking-widest text-narmis-gold mb-3">
              Community Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
              Voices from the NARMIS Circle
            </h2>
            <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
              See what creators, developers, and sports lovers say about circular sharing.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((item, idx) => (
              <ScrollReveal key={item.name} delay={idx * 0.1} yOffset={24} className="h-full">
                <TiltCard maxTilt={3.5}>
                  <div
                    className={`h-full flex flex-col justify-between bg-narmis-surface p-6 sm:p-7 rounded-3xl space-y-5 transition-colors duration-300 ${
                      item.featured
                        ? 'border border-narmis-gold/55 shadow-2xl bg-gradient-to-b from-narmis-surface to-[#1A2E2A]'
                        : 'border border-narmis-mountain/55 hover:border-narmis-gold/45 shadow-lg'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 text-narmis-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-narmis-cream/85 italic leading-relaxed">
                        {item.quote}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-narmis-mountain/35">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-narmis-gold/60"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-narmis-parchment">{item.name}</h4>
                        <p className="text-[11px] text-narmis-cream/60">{item.role}</p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
