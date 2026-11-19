import React, { useState } from 'react';
import { Listing, PurchaseTransaction } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  ShieldAlert,
  CheckCircle2,
  Receipt,
  Truck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface PurchaseModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { processDemoPurchase } = useMarketplace();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(
    user?.location || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103'
  );
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'DEMO_UPI' | 'DEMO_CARD' | 'DEMO_WALLET'>('DEMO_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPurchase, setCompletedPurchase] = useState<PurchaseTransaction | null>(null);

  if (!isOpen) return null;

  const price = listing.purchase_price || 0;
  const platformFee = 0; // ₹0 for hackathon demo
  const deliveryEstimated = 0; // Local meetup / zero charge
  const total = price + platformFee + deliveryEstimated;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate realistic payment delay
      await new Promise((r) => setTimeout(r, 1200));
      const result = await processDemoPurchase({
        listingId: listing.id,
        address: shippingAddress,
      });

      setCompletedPurchase(result);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B88A4A', '#EAD3AA', '#304943', '#D97A53'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedPurchase ? (
          /* Receipt Screen */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[11px] font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                Demo Payment Successful
              </div>
              <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
                Order Confirmed!
              </h3>
              <p className="text-xs text-narmis-cream/70 mt-1">
                Receipt Number:{' '}
                <span className="font-mono font-bold text-narmis-gold">
                  {completedPurchase.receipt_number}
                </span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/90 border border-narmis-mountain/60 text-left text-xs space-y-2">
              <div className="flex justify-between text-narmis-cream/60">
                <span>Item Purchased:</span>
                <span className="font-semibold text-narmis-parchment">{listing.title}</span>
              </div>
              <div className="flex justify-between text-narmis-cream/60">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400 font-serif">
                  ₹{completedPurchase.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-narmis-cream/60">
                <span>Payment Mode:</span>
                <span className="font-medium text-narmis-gold">DEMO SIMULATION (Hackathon)</span>
              </div>
              <div className="flex justify-between text-narmis-cream/60">
                <span>Delivery / Handover:</span>
                <span className="truncate max-w-[200px] text-narmis-parchment">
                  {completedPurchase.shipping_address}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 text-left">
              <strong>Hackathon Note:</strong> This transaction was simulated with mock funds. A
              notification and receipt thread has been created in your messages to coordinate handover
              with the seller.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                View in Dashboard
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
          /* Checkout Form */
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Simulated Checkout
                </h3>
                <p className="text-xs text-narmis-cream/60">{listing.title}</p>
              </div>
            </div>

            {/* Obvious DEMO PAYMENT BANNER (Mandatory) */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider">DEMO PAYMENT MODE:</span>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  This checkout is for hackathon demonstration. No real financial credentials or actual
                  money are charged.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 space-y-2.5 text-xs">
              <div className="flex justify-between text-narmis-cream/70">
                <span>Product Selling Price:</span>
                <span className="font-semibold text-narmis-parchment">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Peer Platform Fee (Hackathon demo):</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Direct Handover / Shipping:</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-narmis-mountain/40 flex justify-between items-center text-sm font-bold">
                <span className="text-narmis-parchment">Total Amount:</span>
                <span className="font-serif text-xl text-emerald-400">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Handover / Shipping Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Handover / Delivery Address *</span>
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold resize-none"
                required
              />
            </div>

            {/* Demo Payment Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Select Simulated Payment Method</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_UPI')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_UPI'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  Demo UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_CARD')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_CARD'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  Demo Card
                </button>
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_WALLET')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_WALLET'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  Demo NetBanking
                </button>
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
                disabled={isProcessing}
                className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Demo Payment...</span>
                ) : (
                  <>
                    <span>Confirm Demo Purchase (₹{total.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
