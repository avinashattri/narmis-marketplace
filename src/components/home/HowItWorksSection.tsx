import React from 'react';
import { Link } from 'react-router-dom';
import {
  CameraRentalIllustration,
  BookExchangeIllustration,
  TennisRentalIllustration,
  HeadphoneSaleIllustration,
} from '../illustrations/CartoonCharacters';
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, MessageSquare } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'List or Discover',
      desc: 'Snap a few photos of items sitting idle in your closet, or browse your local peer feed for gear, electronics, books, and sports equipment.',
      illustration: <CameraRentalIllustration className="w-36 h-36" />,
      tag: 'Snap & Post',
    },
    {
      step: '02',
      title: 'Pick Your Transaction Model',
      desc: 'Decide whether you want to Rent it out daily, Trade it for an item you need with cash balance, or sell it via direct Purchase.',
      illustration: <TennisRentalIllustration className="w-36 h-36" />,
      tag: 'Rent · Trade · Buy',
    },
    {
      step: '03',
      title: 'Negotiate in In-App Chat',
      desc: 'Discuss details, verify condition, arrange meetup or shipping, and finalize trade values or rental dates safely without leaving NARMIS.',
      illustration: <BookExchangeIllustration className="w-36 h-36" />,
      tag: 'Direct Messaging',
    },
    {
      step: '04',
      title: 'Handover & Give It New Life',
      desc: 'Complete the demo checkout, hand over the item, leave mutual peer reviews, and keep the circular economy moving forward.',
      illustration: <HeadphoneSaleIllustration className="w-36 h-36" />,
      tag: 'Verified Handover',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-narmis-surface/40 relative border-y border-narmis-mountain/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            <Sparkles className="w-3 h-3" />
            Simple & Transparent
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-narmis-parchment">
            How NARMIS Works
          </h2>
          <p className="text-sm sm:text-base text-narmis-cream/70 mt-3">
            Giving things a second life should be as simple as sending a message. Here is how peer-to-peer
            sharing works on NARMIS.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/50 hover:border-narmis-gold/50 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:-translate-y-1 relative"
            >
              {/* Step Number Watermark */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-3xl font-black text-narmis-gold/30 group-hover:text-narmis-gold/70 transition-colors">
                  {item.step}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-narmis-mountain text-narmis-parchment border border-narmis-mountain">
                  {item.tag}
                </span>
              </div>

              {/* Character Illustration */}
              <div className="flex justify-center my-3">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {item.illustration}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-narmis-parchment mb-2 group-hover:text-narmis-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-narmis-cream/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Community Banner with CTA */}
        <div className="mt-16 bg-gradient-to-r from-narmis-forestDark via-narmis-surface to-narmis-forestDark rounded-3xl p-8 sm:p-12 border border-narmis-gold/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-narmis-gold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Peer Trust Guarantee</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment">
              Ready to give your idle things a second life?
            </h3>
            <p className="text-xs sm:text-sm text-narmis-cream/75 leading-relaxed">
              Join students, makers, photographers, and athletes trading and renting across the city.
              Listing takes less than two minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/create-listing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <span>List Your First Item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-narmis-mountain/60 hover:bg-narmis-mountain text-narmis-cream border border-narmis-mountain transition-all"
            >
              <MessageSquare className="w-4 h-4 text-narmis-gold" />
              <span>Try In-App Chat</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
