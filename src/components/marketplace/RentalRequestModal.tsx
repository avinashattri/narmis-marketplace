import React, { useState } from 'react';
import { Listing } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface RentalRequestModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const RentalRequestModal: React.FC<RentalRequestModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { createRentalRequest } = useMarketplace();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [durationUnits, setDurationUnits] = useState(2);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const rate = listing.rental_price || 0;
  const durationType = listing.rental_duration || 'Daily';
  const totalAmount = rate * durationUnits;

  // Calculate End Date
  const start = new Date(startDate);
  const end = new Date(start);
  if (durationType === 'Daily') end.setDate(start.getDate() + durationUnits);
  else if (durationType === 'Weekly') end.setDate(start.getDate() + durationUnits * 7);
  else end.setDate(start.getDate() + 1);
  const endDateStr = end.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRentalRequest({
        listing_id: listing.id,
        listing,
        owner_id: listing.user_id,
        start_date: startDate,
        end_date: endDateStr,
        duration_type: durationType,
        duration_units: durationUnits,
        total_amount: totalAmount,
        message: message || `Hi! I would like to rent your ${listing.title} for ${durationUnits} ${durationType.toLowerCase()}(s).`,
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
      <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
              Rental Request Sent!
            </h3>
            <p className="text-xs sm:text-sm text-narmis-cream/80 max-w-sm mx-auto leading-relaxed">
              Your rental request for <span className="font-semibold text-narmis-parchment">{listing.title}</span> has been forwarded to the owner. You can coordinate handover in your active messages!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/messages');
                }}
                className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                Go to Messages
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
              <div className="p-2.5 rounded-xl bg-sky-950/80 text-sky-300 border border-sky-600/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Request Item Rental
                </h3>
                <p className="text-xs text-narmis-cream/60">{listing.title}</p>
              </div>
            </div>

            {/* Rate info card */}
            <div className="p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-narmis-cream/60">Base Rental Rate:</span>
                <p className="font-serif font-bold text-narmis-parchment text-sm">
                  ₹{rate} / {durationType}
                </p>
              </div>
              <div className="text-right">
                <span className="text-narmis-cream/60">Availability:</span>
                <p className="font-semibold text-emerald-300 capitalize">
                  {listing.availability_status || 'Ready for Rent'}
                </p>
              </div>
            </div>

            {/* Dates & duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                  Duration ({durationType}s)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durationUnits}
                    onChange={(e) => setDurationUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    required
                  />
                  <span className="text-xs text-narmis-cream/70 shrink-0 font-medium">
                    = until {endDateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Message to owner */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                Note to Owner
              </label>
              <textarea
                rows={2}
                placeholder="Mention what you will be using it for, pickup preferences..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
              />
            </div>

            {/* Total Estimated Cost */}
            <div className="p-4 rounded-2xl bg-narmis-mountain/30 border border-narmis-gold/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-narmis-cream/70">Estimated Total Cost</span>
                <p className="text-[11px] text-narmis-cream/50">
                  {durationUnits} {durationType}(s) × ₹{rate}
                </p>
              </div>
              <div className="text-xl font-bold font-serif text-narmis-gold">
                ₹{totalAmount.toLocaleString('en-IN')}
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
                {isSubmitting ? 'Sending Request...' : 'Submit Rental Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
