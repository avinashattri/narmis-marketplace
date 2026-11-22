import React from 'react';
import { HeroParallax } from '../components/hero/HeroParallax';
import { ThreeFeaturesSection } from '../components/home/ThreeFeaturesSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FeaturedListingsSection } from '../components/home/FeaturedListingsSection';
import { Star, ShieldCheck, HeartHandshake, Leaf, Users } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. Hero Section with Castle & Mountain Parallax */}
      <HeroParallax />

      {/* Trust & Impact Bar */}
      <section className="bg-narmis-surface border-y border-narmis-mountain/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-narmis-gold mb-1">
                <Leaf className="w-4 h-4" />
                <span className="font-serif text-2xl font-bold text-narmis-parchment">100%</span>
              </div>
              <p className="text-xs text-narmis-cream/70 uppercase tracking-wider font-semibold">
                Circular Commerce
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-narmis-gold mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span className="font-serif text-2xl font-bold text-narmis-parchment">₹0</span>
              </div>
              <p className="text-xs text-narmis-cream/70 uppercase tracking-wider font-semibold">
                Listing Platform Fees
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-narmis-gold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-serif text-2xl font-bold text-narmis-parchment">Verified</span>
              </div>
              <p className="text-xs text-narmis-cream/70 uppercase tracking-wider font-semibold">
                Peer Ratings & Reviews
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-narmis-gold mb-1">
                <Users className="w-4 h-4" />
                <span className="font-serif text-2xl font-bold text-narmis-parchment">3 Models</span>
              </div>
              <p className="text-xs text-narmis-cream/70 uppercase tracking-wider font-semibold">
                Rent · Trade · Purchase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Core Features Showcase */}
      <ThreeFeaturesSection />

      {/* 3. How NARMIS Works */}
      <HowItWorksSection />

      {/* 4. Featured Listings */}
      <FeaturedListingsSection />

      {/* Community Testimonials */}
      <section className="py-20 bg-narmis-forestDark/80 border-t border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl font-bold text-narmis-parchment">
              Voices from the NARMIS Circle
            </h2>
            <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
              See what creators, developers, and sports lovers say about circular sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-narmis-surface p-6 rounded-2xl border border-narmis-mountain/50 space-y-4">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-narmis-cream/80 italic leading-relaxed">
                "Rented out my Sony A7 IV camera for a campus documentary for ₹1,200/day. The rental request and confirmation workflow in chat was super smooth!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-narmis-mountain/30">
                <img
                  src="https://ui-avatars.com/api/?name=Shraddha&background=80674D&color=F5E9D2&bold=true&size=150"
                  alt="Shraddha"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-narmis-gold/60"
                />
                <div>
                  <h4 className="text-xs font-bold text-narmis-parchment">Shraddha</h4>
                  <p className="text-[10px] text-narmis-cream/60">Filmmaker & Vocalist, Whitefield</p>
                </div>
              </div>
            </div>

            <div className="bg-narmis-surface p-6 rounded-2xl border border-narmis-gold/40 shadow-xl space-y-4">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-narmis-cream/80 italic leading-relaxed">
                "Traded my Keychron mechanical keyboard for a Logitech MX Master mouse plus ₹1,200 cash offset.
                The trade valuation and mutual approval flow worked seamlessly!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-narmis-mountain/30">
                <img
                  src="https://ui-avatars.com/api/?name=Sanchit&background=B88A4A&color=142523&bold=true&size=150"
                  alt="Sanchit"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-narmis-gold/60"
                />
                <div>
                  <h4 className="text-xs font-bold text-narmis-parchment">Sanchit</h4>
                  <p className="text-[10px] text-narmis-cream/60">Volleyball Player & Gamer, Indiranagar</p>
                </div>
              </div>
            </div>

            <div className="bg-narmis-surface p-6 rounded-2xl border border-narmis-mountain/50 space-y-4">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-narmis-cream/80 italic leading-relaxed">
                "Circulated custom 5-inch FPV drone racing gear and flight controllers. Communication in the built-in P2P chat was instant and verified."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-narmis-mountain/30">
                <img
                  src="https://ui-avatars.com/api/?name=Javed+Bhaiya&background=304943&color=EAD3AA&bold=true&size=150"
                  alt="Javed Bhaiya"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-narmis-gold/60"
                />
                <div>
                  <h4 className="text-xs font-bold text-narmis-parchment">Javed Bhaiya</h4>
                  <p className="text-[10px] text-narmis-cream/60">FPV Drone Builder, Frazer Town</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
