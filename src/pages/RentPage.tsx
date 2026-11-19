import React from 'react';
import { ExplorePage } from './ExplorePage';
import { LaptopRentalIllustration } from '../components/illustrations/CartoonCharacters';
import { Calendar, ShieldCheck, Clock, Sparkles } from 'lucide-react';

export const RentPage: React.FC = () => {
  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-950/80 text-sky-200 border border-sky-600/40">
                <Calendar className="w-3.5 h-3.5" />
                Peer-to-Peer Rentals
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-narmis-parchment">
                Rent Premium Gear By The Day
              </h1>
              <p className="text-sm sm:text-base text-narmis-cream/80 leading-relaxed">
                Why purchase a 4K camera or power drill for a 2-day job? Rent cameras, MacBook sprints,
                gaming rigs, and sports gear directly from verified neighborhood peers.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-narmis-cream/70">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-narmis-gold" />
                  <span>Hourly & Daily Rates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold" />
                  <span>Peer Verified Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-narmis-gold" />
                  <span>Direct In-App Calendar Booking</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden md:block">
              <LaptopRentalIllustration className="w-48 h-48 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      <ExplorePage
        initialType="rent"
        titleOverride="Rental Marketplace Catalogue"
        subtitleOverride="Browse all peer gear available for daily or weekly rental."
      />
    </div>
  );
};
