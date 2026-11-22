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
              NARMIS Platform Guide
            </h3>
            <p className="text-xs text-narmis-cream/60">
              How Renting, Trading & Direct Purchases Work
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
            Direct Purchase
          </button>
          <button
            onClick={() => setActiveTab('judge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'judge'
                ? 'bg-narmis-gold text-narmis-charcoal font-bold'
                : 'text-narmis-cream/70 hover:text-white'
            }`}
          >
            Platform Trust
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
                <span className="text-[10px] text-narmis-cream/60">UPI QR & Order Records</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-4 text-xs sm:text-sm text-narmis-cream/80 leading-relaxed animate-fadeIn">
            <h4 className="font-serif font-bold text-narmis-parchment text-base">
              How the Trade Negotiation Engine Works:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Navigate to <strong className="text-narmis-gold">Trade</strong> in the navigation bar.
              </li>
              <li>
                Click on any trade listing (for example, Sanchit&apos;s <strong className="text-narmis-parchment">Keychron Q1 Pro Mechanical Keyboard</strong>).
              </li>
              <li>
                Click <strong className="text-narmis-gold">Make Trade Offer</strong>. The valuation calculator displays the difference between the target listing and your proposed item.
              </li>
              <li>
                Submit your offer. An interactive <strong className="text-narmis-parchment">Trade Proposal Card</strong> is posted into <strong className="text-narmis-gold">Messages</strong>.
              </li>
              <li>
                Negotiate cash offsets and finalize the exchange agreement directly with the listing owner.
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
              How Peer Rental Reservations Work:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Click <strong className="text-narmis-gold">Rent</strong> in the top navigation.
              </li>
              <li>
                Select a rental item such as the <strong className="text-narmis-parchment">Sony Alpha 7 IV Camera</strong> (Daily rate: ₹1,200).
              </li>
              <li>
                Click <strong className="text-narmis-gold">Request Rental</strong>, pick your dates and duration, and accept the rental care agreement.
              </li>
              <li>
                Submit the request. A booking card is sent to the owner in <strong className="text-narmis-gold">Messages</strong> and their Dashboard.
              </li>
              <li>
                Coordinate handover details and confirm pickup & return directly in chat.
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
              Completing a Direct Purchase Payment:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                Navigate to <strong className="text-narmis-gold">Purchase</strong>.
              </li>
              <li>
                Choose an item and inspect its condition grade, disclosed defects, and included accessories.
              </li>
              <li>
                Click <strong className="text-emerald-400">Proceed to Payment</strong>.
              </li>
              <li>
                Scan the UPI QR code (or enlarge/save it), complete payment in your UPI app, enter your handover address, and confirm payment.
              </li>
              <li>
                A payment submission record (<code className="text-narmis-gold">NRM-XXXX</code>) is created while the seller verifies receipt before handover.
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
              NARMIS Trust & Architecture Highlights:
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Campus Verification & Privacy:</strong> College IDs are stored as
                  authenticated private assets via Cloudinary and MongoDB Atlas with strict
                  server-side ownership guards.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Transparent Condition Disclosure:</strong> Standardized condition badges,
                  defect checklists, accessory breakdowns, and separate condition photo galleries.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Circular Identity:</strong> Custom forest-green, parchment, and gold aesthetic
                  designed around Chitkara University and surrounding peer communities.
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
