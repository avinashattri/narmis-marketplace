import React, { useState } from 'react';
import { Listing } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Repeat, ArrowLeftRight, CheckCircle2, Plus, Minus } from 'lucide-react';

interface TradeOfferModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeOfferModal: React.FC<TradeOfferModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { createTradeOffer } = useMarketplace();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [offeredTitle, setOfferedTitle] = useState('');
  const [offeredDesc, setOfferedDesc] = useState('');
  const [offeredValue, setOfferedValue] = useState<number>(listing.estimated_value ? Math.round(listing.estimated_value * 0.8) : 2000);
  const [cashAdjustment, setCashAdjustment] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetValue = listing.estimated_value || 0;
  // Net difference calculation: Target Value - (Offered Value + Cash Adjustment)
  const difference = targetValue - (offeredValue + cashAdjustment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!offeredTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createTradeOffer({
        listing_id: listing.id,
        listing,
        owner_id: listing.user_id,
        offered_item_title: offeredTitle,
        offered_item_description: offeredDesc,
        offered_item_value: offeredValue,
        cash_adjustment: cashAdjustment,
        negotiation_notes: notes,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
              Trade Proposal Sent!
            </h3>
            <p className="text-xs sm:text-sm text-narmis-cream/80 max-w-sm mx-auto leading-relaxed">
              Your trade offer of <span className="font-semibold text-narmis-parchment">"{offeredTitle}"</span> for <span className="font-semibold text-narmis-parchment">{listing.title}</span> has been dispatched to the owner.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/messages');
                }}
                className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                Go to Trade Chat
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-medium hover:bg-narmis-mountain/80 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-600/40">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Propose Peer-to-Peer Trade
                </h3>
                <p className="text-xs text-narmis-cream/60">
                  Target item: <span className="font-semibold text-narmis-parchment">{listing.title}</span>
                </p>
              </div>
            </div>

            {/* Target Item summary */}
            <div className="p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-narmis-cream/60">Target Item Estimated Value:</span>
                <p className="font-serif font-bold text-narmis-parchment text-sm">
                  ₹{targetValue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-narmis-cream/60">Desired by Owner:</span>
                <p className="font-semibold text-narmis-gold text-xs truncate max-w-[200px]">
                  {listing.trade_desired || 'Open to all equivalent tech/gear'}
                </p>
              </div>
            </div>

            {/* My Offered Item fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                  Item You are Offering *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Logitech MX Master 3S Mouse / Audio Interface"
                  value={offeredTitle}
                  onChange={(e) => setOfferedTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                    Your Item Estimated Value (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={offeredValue}
                    onChange={(e) => setOfferedValue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                    Cash Adjustment Offset (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={cashAdjustment}
                    onChange={(e) => setCashAdjustment(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    placeholder="e.g. +500 to add cash"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                  Item Condition & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe age, accessories included, cosmetic condition..."
                  value={offeredDesc}
                  onChange={(e) => setOfferedDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                />
              </div>
            </div>

            {/* Trade Valuation Calculator Board */}
            <div className="p-4 rounded-2xl bg-narmis-mountain/30 border border-narmis-gold/30 space-y-2 text-xs">
              <div className="flex justify-between text-narmis-cream/70">
                <span>Requested Item:</span>
                <span className="font-semibold text-narmis-parchment">₹{targetValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Your Offered Item:</span>
                <span className="font-semibold text-narmis-parchment">₹{offeredValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Cash Adjustment:</span>
                <span className={`font-semibold ${cashAdjustment >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {cashAdjustment >= 0 ? `+ ₹${cashAdjustment}` : `- ₹${Math.abs(cashAdjustment)}`}
                </span>
              </div>

              <div className="pt-2 border-t border-narmis-mountain/40 flex justify-between items-center text-sm font-bold">
                <span className="text-narmis-parchment">Valuation Gap / Status:</span>
                <span
                  className={`font-serif ${
                    difference === 0
                      ? 'text-emerald-400'
                      : difference > 0
                      ? 'text-amber-300'
                      : 'text-sky-300'
                  }`}
                >
                  {difference === 0
                    ? 'Perfect Balance (1:1)'
                    : difference > 0
                    ? `₹${difference.toLocaleString('en-IN')} in owner favour`
                    : `₹${Math.abs(difference).toLocaleString('en-IN')} in your favour`}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-narmis-mountain/60 text-narmis-cream text-xs font-semibold hover:bg-narmis-mountain transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 rounded-xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                {isSubmitting ? 'Sending Proposal...' : 'Send Trade Proposal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
