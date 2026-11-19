import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Repeat,
  Calendar,
  ShoppingBag,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  LaptopRentalIllustration,
  KeyboardTradeIllustration,
  CricketPurchaseIllustration,
} from '../illustrations/CartoonCharacters';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'trade' | 'rent' | 'buy' | 'judge'>('welcome');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-narmis-surface border-2 border-narmis-gold/70 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-narmis-gold/20 text-narmis-gold border border-narmis-gold/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-narmis-parchment">
              NARMIS Hackathon Evaluation Guide
            </h3>
            <p className="text-xs text-narmis-cream/60">
              Interactive Walkthrough for Evaluators & Judges
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'welcome'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'trade'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Test Trade Flow
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'rent'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Test Rental
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'buy'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Demo Checkout
          </button>
          <button
            onClick={() => setActiveTab('judge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'judge'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Judge Tips
          </button>
        </div>

        {/* Content by Tab */}
        {activeTab === 'welcome' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <div className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-narmis-gold shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-narmis-parchment text-base">
                  What makes NARMIS different?
                </h4>
                <p className="text-xs text-narmis-cream/70 mt-0.5">
                  Unlike traditional single-purpose classifieds, NARMIS unifies RENT, TRADE, and
                  PURCHASE under one circular economy platform.
                </p>
              </div>
            </div>

            <p>
              Every product listed on NARMIS can cycle through multiple owners and uses without creating
              electronic or manufactured waste.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-600/30">
                <Calendar className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                <span className="font-bold text-narmis-parchment text-xs block">RENT</span>
                <span className="text-[10px] text-narmis-cream/60">Hourly/Daily</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/30">
                <Repeat className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <span className="font-bold text-narmis-parchment text-xs block">TRADE</span>
                <span className="text-[10px] text-narmis-cream/60">Valuation & Cash Offsets</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-600/30">
                <ShoppingBag className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="font-bold text-narmis-parchment text-xs block">PURCHASE</span>
                <span className="text-[10px] text-narmis-cream/60">Demo Checkout & Receipts</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <h4 className="font-serif font-bold text-narmis-parchment text-base">
              Testing the Trade Negotiation Engine:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Navigate to <strong className="text-narmis-gold">Trade</strong> in the navigation bar.
              </li>
              <li>
                Click on the <strong className="text-narmis-parchment">Keychron Q1 Pro Mechanical Keyboard</strong> (owned by Aarav Sharma).
              </li>
              <li>
                Click <strong className="text-narmis-gold">Make Trade Offer</strong>. Notice the automated valuation board that calculates the value difference between the keyboard and your offer.
              </li>
              <li>
                Submit your offer. Notice how an interactive <strong className="text-narmis-parchment">Trade Proposal Card</strong> is created in <strong className="text-narmis-gold">Messages</strong>.
              </li>
              <li>
                Click the bottom-right <strong className="text-narmis-gold">Demo Switcher</strong> and switch to <strong className="text-narmis-parchment">Aarav Sharma</strong>. Open the <strong className="text-narmis-gold">Dashboard → Trades tab</strong> to see the incoming offer and click <em>Accept</em> or <em>Reject</em>!
              </li>
            </ol>

            <div className="flex justify-center pt-2">
              <KeyboardTradeIllustration className="w-36 h-36" />
            </div>
          </div>
        )}

        {activeTab === 'rent' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <h4 className="font-serif font-bold text-narmis-parchment text-base">
              Testing the Rental Reservation Flow:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Click <strong className="text-narmis-gold">Rent</strong> in the top navigation.
              </li>
              <li>
                Select the <strong className="text-narmis-parchment">Sony Alpha 7 IV Camera</strong> (Daily rate: ₹1,200).
              </li>
              <li>
                Click <strong className="text-narmis-gold">Request Rental</strong>. Choose your dates and duration (e.g. 2 days = ₹2,400).
              </li>
              <li>
                Submit the request. An active rental card is automatically dispatched into the owner's chat thread.
              </li>
              <li>
                Switch to <strong className="text-narmis-parchment">Priya Patel</strong> using the Demo Switcher to review and approve the booking in the Dashboard!
              </li>
            </ol>

            <div className="flex justify-center pt-2">
              <LaptopRentalIllustration className="w-36 h-36" />
            </div>
          </div>
        )}

        {activeTab === 'buy' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <h4 className="font-serif font-bold text-narmis-parchment text-base">
              Testing Demo Purchases & Simulated Receipts:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Navigate to <strong className="text-narmis-gold">Purchase</strong>.
              </li>
              <li>
                Choose any item (e.g. <em>Nintendo Switch OLED</em> or <em>Sony WH-1000XM5</em>).
              </li>
              <li>
                Click <strong className="text-emerald-400">Purchase Item (Demo)</strong>.
              </li>
              <li>
                Select simulated UPI or Card payment, enter your delivery address, and confirm.
              </li>
              <li>
                Enjoy the celebratory confetti! A verified receipt code (<code className="text-narmis-gold">NRM-XXXX</code>) and handover verification QR code are produced immediately.
              </li>
            </ol>

            <div className="flex justify-center pt-2">
              <CricketPurchaseIllustration className="w-36 h-36" />
            </div>
          </div>
        )}

        {activeTab === 'judge' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <h4 className="font-serif font-bold text-narmis-parchment text-base">
              Key Architectural Points for Evaluation:
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Full Relational Database Schema:</strong> Prepared with 10 tables, Row Level
                  Security policies, and triggers in <code>supabase/migrations/</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Dual-Store Architecture:</strong> Supabase-connected when configured, with a
                  seamless simulated reactive store for zero-friction hackathon evaluation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Brand Identity:</strong> Custom medieval mountain castle parallax hero matching
                  the reference image, with cohesive editorial cartoon characters.
                </span>
              </li>
            </ul>
          </div>
        )}

        <div className="pt-6 border-t border-narmis-mountain/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
          >
            Got It, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
};
